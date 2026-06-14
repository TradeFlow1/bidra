const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const npxCmd = isWindows ? "npx.cmd" : "npx";

function run(command, args, options = {}) {
  console.log("");
  console.log("==> " + [command].concat(args).join(" "));

  const result = childProcess.spawnSync(command, args, {
    stdio: "inherit",
    shell: isWindows,
    env: Object.assign({}, process.env, options.env || {})
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error("Command failed with exit code " + result.status + ": " + command + " " + args.join(" "));
  }
}

function removeDir(target) {
  if (!fs.existsSync(target)) return;

  console.log("");
  console.log("==> clean " + target);

  try {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch (err) {
    if (isWindows) {
      childProcess.spawnSync("cmd.exe", ["/c", "rmdir", "/s", "/q", target], { stdio: "inherit", shell: false });
    }
  }

  if (fs.existsSync(target)) {
    throw new Error("Unable to remove " + target + ". Close dev server, VS Code file watchers, or OneDrive sync lock and retry.");
  }
}

function waitForUrl(url, timeoutMs) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    function attempt() {
      const req = http.get(url, (res) => {
        res.resume();

        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }

        retry();
      });

      req.on("error", retry);

      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - started > timeoutMs) {
        reject(new Error("Timed out waiting for " + url));
        return;
      }

      setTimeout(attempt, 1000);
    }

    attempt();
  });
}

async function main() {
  removeDir(".next");

  run(npmCmd, ["run", "prisma:generate"]);
  run("node", ["tools/db-drift-audit.cjs"]);
  run(npmCmd, ["run", "typecheck"]);
  run(npmCmd, ["run", "lint"]);
  run(npmCmd, ["run", "build"]);

  const port = process.env.MARKETPLACE_GATE_PORT || "3100";
  const baseUrl = "http://127.0.0.1:" + port;

  console.log("");
  console.log("==> starting production server on " + baseUrl);

  const server = childProcess.spawn(npmCmd, ["run", "start", "--", "-p", port], {
    stdio: "inherit",
    shell: isWindows,
    env: Object.assign({}, process.env, { PORT: port })
  });

  let serverStopped = false;

  server.on("exit", () => {
    serverStopped = true;
  });

  try {
    await waitForUrl(baseUrl, 45000);

    if (serverStopped) {
      throw new Error("Next server stopped before Playwright could run.");
    }

    run(npxCmd, ["playwright", "test", "tests/e2e/marketplace-launch.spec.ts"], {
      env: { MARKETPLACE_BASE_URL: baseUrl }
    });
  } finally {
    if (!serverStopped) {
      server.kill();
    }
  }

  console.log("");
  console.log("PASS marketplace:gate");
}

main().catch((err) => {
  console.error("");
  console.error("FAIL marketplace:gate");
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
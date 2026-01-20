const { PrismaClient } = require("@prisma/client");
console.log("ListingStatus enum:", PrismaClient?.dmmf?.datamodel?.enums?.find(e=>e.name==="ListingStatus")?.values?.map(v=>v.name) || "NOT_FOUND_IN_DMMF");

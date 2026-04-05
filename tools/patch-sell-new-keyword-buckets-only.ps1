#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}

Set-Location $repoRoot

$target = Join-Path $repoRoot 'app\sell\new\sell-new-client.tsx'
if (-not (Test-Path -LiteralPath $target)) {
    throw "Target file not found: $target"
}

$content = Get-Content -LiteralPath $target -Raw

$startMarker = 'const KEYWORD_BUCKETS: { cat: string; kws: string[] }[] = ['
$endMarker = '];' + [Environment]::NewLine + 'function normalizeSuggestedCategory(raw: string): string {'

$startIndex = $content.IndexOf($startMarker)
if ($startIndex -lt 0) {
    throw "Could not find KEYWORD_BUCKETS start marker."
}

$endIndex = $content.IndexOf($endMarker, $startIndex)
if ($endIndex -lt 0) {
    throw "Could not find KEYWORD_BUCKETS end marker."
}

$newBlockLines = @(
    'const KEYWORD_BUCKETS: { cat: string; kws: string[] }[] = [',
    '  // Tech & Electronics',
    '  { cat: joinCategory("Tech & Electronics", "Phones & Accessories"), kws: ["iphone","android","samsung","pixel","phone","mobile","charger","case","airpods","sim","telstra","optus","vodafone"] },',
    '  { cat: joinCategory("Tech & Electronics", "Computers"), kws: ["laptop","notebook","macbook","imac","pc","desktop","computer","monitor","keyboard","mouse","ssd","hdd","hard drive","gpu","graphics card","ram","motherboard","windows","linux"] },',
    '  { cat: joinCategory("Tech & Electronics", "Gaming"), kws: ["playstation","ps4","ps5","xbox","nintendo","switch","controller","console","game console","steam deck"] },',
    '  { cat: joinCategory("Tech & Electronics", "TV & Audio"), kws: ["tv","television","soundbar","speaker","speakers","subwoofer","headphones","earbuds","stereo","amplifier","receiver"] },',
    '  { cat: joinCategory("Tech & Electronics", "Cameras"), kws: ["camera","dslr","mirrorless","gopro","lens","tripod","canon","nikon","sony"] },',
    '',
    '  // Home & Furniture',
    '  { cat: joinCategory("Home & Furniture", "Living Room"), kws: ["sofa","couch","lounge","coffee table","tv unit","entertainment unit","recliner"] },',
    '  { cat: joinCategory("Home & Furniture", "Bedroom"), kws: ["bed","mattress","frame","wardrobe","dresser","drawers","bedside","nightstand"] },',
    '  { cat: joinCategory("Home & Furniture", "Dining"), kws: ["dining table","dining set","chairs","bar stools","buffet","sideboard"] },',
    '  { cat: joinCategory("Home & Furniture", "Outdoor & Garden"), kws: ["outdoor setting","patio","deck","bbq","grill","umbrella","gazebo"] },',
    '  { cat: joinCategory("Home & Furniture", "Office Furniture"), kws: ["desk","office chair","standing desk","filing cabinet"] },',
    '  { cat: joinCategory("Home & Furniture", "Storage"), kws: ["shelves","shelving","storage","cupboard","cabinet","rack"] },',
    '  { cat: joinCategory("Home & Furniture", "Home Decor"), kws: ["rug","curtains","blinds","lamp","mirror","artwork","vase","cushion"] },',
    '',
    '  // Appliances',
    '  { cat: joinCategory("Appliances", "Kitchen Appliances"), kws: ["fridge","freezer","microwave","dishwasher","oven","cooktop","air fryer","kettle","toaster","coffee machine","mixer"] },',
    '  { cat: joinCategory("Appliances", "Laundry Appliances"), kws: ["washing machine","washer","dryer","tumble dryer"] },',
    '  { cat: joinCategory("Appliances", "Heating & Cooling"), kws: ["aircon","air conditioner","heater","fan","dehumidifier"] },',
    '  { cat: joinCategory("Appliances", "Vacuums"), kws: ["vacuum","dyson","robot vacuum","roomba","vacuum cleaner","stick vacuum","miele"] },',
    '',
    '  // Tools & DIY',
    '  { cat: joinCategory("Tools & DIY", "Power Tools"), kws: ["drill","impact","driver","saw","circular","jigsaw","sander","grinder","router","nail gun","compressor","air compressor","makita","dewalt","milwaukee","ryobi","ozito"] },',
    '  { cat: joinCategory("Tools & DIY", "Hand Tools"), kws: ["spanner","wrench","socket","ratchet","hammer","screwdriver","pliers","allen","hex","chisel","clamp","vice","tape measure","level","stanley knife","utility knife","tool kit","toolbox"] },',
    '  { cat: joinCategory("Tools & DIY", "Garden Tools"), kws: ["lawn mower","mower","whipper","line trimmer","hedge trimmer","blower","leaf blower","chainsaw","edger","rake","shovel","spade","secateurs"] },',
    '  { cat: joinCategory("Tools & DIY", "Building Materials"), kws: ["timber","wood","plywood","mdf","gyprock","drywall","cement","concrete","bricks","pavers","steel","aluminium","insulation","paint","primer","tiles"] },',
    '',
    '  // Sports & Outdoors',
    '  { cat: joinCategory("Sports & Outdoors", "Fitness"), kws: ["treadmill","weights","dumbbell","barbell","gym","exercise bike","rowing machine","bench press","kettlebell"] },',
    '  { cat: joinCategory("Sports & Outdoors", "Camping"), kws: ["tent","swag","sleeping bag","camping","esky","gazebo","camp chair"] },',
    '  { cat: joinCategory("Sports & Outdoors", "Cycling"), kws: ["bike","bicycle","helmet","mtb","road bike","bmx"] },',
    '  { cat: joinCategory("Sports & Outdoors", "Fishing"), kws: ["fishing","rod","reel","tackle","bait"] },',
    '  { cat: joinCategory("Sports & Outdoors", "Water Sports"), kws: ["surf","surfboard","sup","paddle board","kayak","wetsuit"] },',
    '',
    '  // Kids & Toys',
    '  { cat: joinCategory("Kids & Toys", "Toys"), kws: ["lego","toy","doll","action figure","hot wheels","barbie"] },',
    '  { cat: joinCategory("Kids & Toys", "Games"), kws: ["board game","card game","puzzle"] },',
    '  { cat: joinCategory("Kids & Toys", "Kids Clothing"), kws: ["kids","kid''s","child","children","size 4","size 6","size 8","size 10"] },',
    '',
    '  // Books & Media',
    '  { cat: joinCategory("Books & Media", "Books"), kws: ["book","novel","textbook","paperback","hardcover"] },',
    '  { cat: joinCategory("Books & Media", "Movies"), kws: ["dvd","bluray","blu-ray","movie"] },',
    '  { cat: joinCategory("Books & Media", "Music"), kws: ["vinyl","record","cd","guitar","piano","keyboard instrument"] },',
    '  { cat: joinCategory("Books & Media", "Games"), kws: ["board game","card game","puzzle"] },',
    '',
    '  // Collectibles & Vintage',
    '  { cat: joinCategory("Collectibles & Vintage", "Coins"), kws: ["coin","coins","currency"] },',
    '  { cat: joinCategory("Collectibles & Vintage", "Trading Cards"), kws: ["pokemon","mtg","magic the gathering","trading card"] },',
    '  { cat: joinCategory("Collectibles & Vintage", "Memorabilia"), kws: ["memorabilia","signed","autograph"] },',
    '  { cat: joinCategory("Collectibles & Vintage", "Antiques"), kws: ["antique","vintage"] },',
    '',
    '  // Vehicles',
    '  { cat: joinCategory("Vehicles", "Cars"), kws: ["car","sedan","hatch","ute","4x4","4wd","ford","holden","toyota","mazda","hyundai","kia"] },',
    '  { cat: joinCategory("Vehicles", "Motorcycles"), kws: ["motorbike","motorcycle","helmet","yamaha","honda","kawasaki","ducati"] },',
    '  { cat: joinCategory("Vehicles", "Vehicle Parts & Accessories"), kws: ["tyres","tires","rim","wheels","car parts","towbar","roof rack","battery","dashcam"] },',
    '  { cat: joinCategory("Vehicles", "Boats & Marine"), kws: ["boat","marine","outboard","jetski","jet ski"] },',
    '  { cat: joinCategory("Vehicles", "Caravans & Campers"), kws: ["caravan","camper","campervan","rv"] },',
    '',
    '  // Pet Supplies',
    '  { cat: "Pet Supplies (NO LIVE ANIMALS)", kws: ["dog","cat","pet","leash","collar","litter","aquarium","kennel","harness","pet bed","crate","carrier","scratching post","cat tree","fish tank"] },',
    '',
    '  // Fashion & Wearables',
    '  { cat: joinCategory("Fashion & Wearables", "Men''s Clothing"), kws: ["mens","men''s","shirt","tshirt","tee","hoodie","jumper","jacket","jeans","shorts","pants","suit","tie"] },',
    '  { cat: joinCategory("Fashion & Wearables", "Women''s Clothing"), kws: ["womens","women''s","dress","skirt","blouse","top","heels","cardigan","jacket","jeans","activewear","leggings"] },',
    '  { cat: joinCategory("Fashion & Wearables", "Shoes"), kws: ["shoes","sneakers","runners","boots","heels","sandals","thongs","nike","adidas","asics","new balance"] },',
    '  { cat: joinCategory("Fashion & Wearables", "Bags"), kws: ["bag","handbag","backpack","rucksack","wallet","purse","luggage","suitcase"] },',
    '  { cat: joinCategory("Fashion & Wearables", "Jewellery & Watches"), kws: ["watch","watches","rolex","seiko","casio","ring","necklace","bracelet","earrings","jewellery","jewelry"] },',
    '',
    '  // Beauty & Personal Care',
    '  { cat: joinCategory("Beauty & Personal Care", "Skincare"), kws: ["skincare","cleanser","moisturiser","moisturizer","serum","sunscreen","spf","retinol","toner"] },',
    '  { cat: joinCategory("Beauty & Personal Care", "Hair Care"), kws: ["shampoo","conditioner","hair dryer","hairdryer","straightener","curling iron","ghd","dyson airwrap"] },',
    '  { cat: joinCategory("Beauty & Personal Care", "Fragrances"), kws: ["perfume","cologne","fragrance","eau de parfum","aftershave"] },',
    '  { cat: joinCategory("Beauty & Personal Care", "Grooming"), kws: ["shaver","razor","clippers","trimmer","beard","grooming"] },',
    '',
    '  // Baby & Nursery',
    '  { cat: joinCategory("Baby & Nursery", "Prams"), kws: ["pram","stroller","pushchair","buggy"] },',
    '  { cat: joinCategory("Baby & Nursery", "Car Seats"), kws: ["car seat","baby seat","booster seat","capsule"] },',
    '  { cat: joinCategory("Baby & Nursery", "Nursery Furniture"), kws: ["cot","crib","bassinet","change table","change pad","high chair","nursery"] },',
    '',
    '  // Art',
    '  { cat: joinCategory("Art", "Paintings"), kws: ["painting","canvas","acrylic","oil painting","watercolour","watercolor"] },',
    '  { cat: joinCategory("Art", "Sculpture"), kws: ["sculpture","statue","ceramic","clay","bronze"] },',
    '  { cat: joinCategory("Art", "Photography"), kws: ["photography","photo print","print","framed print"] },',
    '',
    '  // Office & Business',
    '  { cat: joinCategory("Office & Business", "Office Equipment"), kws: ["printer","scanner","label printer","shredder","laminator","monitor arm","docking station"] },',
    '  { cat: joinCategory("Office & Business", "Supplies"), kws: ["stationery","paper","notebook","pens","labels","ink","toner"] },',
    '  { cat: joinCategory("Office & Business", "POS & Retail"), kws: ["pos","eftpos","receipt printer","cash drawer","barcode scanner","square terminal"] },',
    '',
    '  // Industrial',
    '  { cat: joinCategory("Industrial", "Machinery"), kws: ["machinery","lathe","mill","press","forklift","generator","welder","welding"] },',
    '  { cat: joinCategory("Industrial", "Electrical"), kws: ["electrical","cable","conduit","switchboard","breaker","inverter"] },',
    '  { cat: joinCategory("Industrial", "Safety Equipment"), kws: ["safety","ppe","hi vis","high vis","helmet","gloves","goggles","earmuffs","respirator"] },',
    '',
    '  // Health & Medical (non-prescription)',
    '  { cat: joinCategory("Health & Medical (non-prescription)", "Mobility"), kws: ["wheelchair","walker","walking frame","mobility scooter","crutches","cane"] },',
    '  { cat: joinCategory("Health & Medical (non-prescription)", "Monitoring Devices"), kws: ["blood pressure","bp monitor","thermometer","pulse oximeter","oximeter","glucose monitor"] },',
    '  { cat: joinCategory("Health & Medical (non-prescription)", "Wellness"), kws: ["massage gun","foam roller","yoga mat","meditation","sauna blanket"] },',
    '',
    '  // Tickets (where permitted)',
    '  { cat: joinCategory("Tickets (where permitted)", "Events"), kws: ["tickets","event ticket","festival ticket","gig ticket"] },',
    '  { cat: joinCategory("Tickets (where permitted)", "Sport"), kws: ["match ticket","game ticket","sport ticket"] },',
    '  { cat: joinCategory("Tickets (where permitted)", "Theatre"), kws: ["theatre ticket","theater ticket","show ticket","musical"] },',
    '',
    '  // Services',
    '  { cat: joinCategory("Services", "Trade Services"), kws: ["plumber","electrician","tradie","handyman","tiling","painting service"] },',
    '  { cat: joinCategory("Services", "Creative Services"), kws: ["design","graphic design","photographer","videographer","logo"] },',
    '  { cat: joinCategory("Services", "Lessons"), kws: ["tutor","tutoring","lessons","guitar lessons","piano lessons","driving lessons"] },',
    '',
    '  // Free items + Other',
    '  { cat: "Free items", kws: ["free","giveaway","free to good home","no charge"] },',
    '  { cat: "Other", kws: ["misc","miscellaneous","assorted","bundle","lot"] },',
    '];'
)

$newBlock = [string]::Join([Environment]::NewLine, $newBlockLines)
$content = $content.Substring(0, $startIndex) + $newBlock + $content.Substring($endIndex)
[System.IO.File]::WriteAllText($target, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] patched $target"
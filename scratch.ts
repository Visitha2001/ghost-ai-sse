import { Liveblocks } from "@liveblocks/node";
const liveblocks = new Liveblocks({ secret: "sk_dev_s1LlNqEQM0Y2E39dysKWXKxyYvQKh5EHoRk5IecsKM2Xyth9_V7O5-918m_wZ6sW" });
liveblocks.getStorageDocument("visith-nirmal-123-6q9e", "json").then(doc => console.log(JSON.stringify(doc, null, 2))).catch(console.error);

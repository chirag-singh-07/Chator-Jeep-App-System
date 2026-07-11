const { z } = require("zod");
const schema = z.object({
  body: z.object({
    name: z.string().min(3)
  })
});
try {
  schema.parse({ body: { name: "ab" } });
} catch(e) {
  console.log(e.flatten().fieldErrors);
}

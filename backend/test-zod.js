const { z } = require("zod");
const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
const dlRegex = /^[A-Z]{2}\d{2}\s?\d{11}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const schema = z.object({
  body: z.object({
    documents: z.object({
      aadhaarNumber: z.string().regex(/^\d{12}$/),
      panNumber: z.string().regex(panRegex),
    })
  })
});

try {
  schema.parse({ body: { documents: { aadhaarNumber: "1234 5678", panNumber: "ABC" } } });
} catch(e) {
  console.log("Error messages flattened:");
  console.log(e.flatten().fieldErrors);
}

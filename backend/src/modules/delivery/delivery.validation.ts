import { z } from "zod";

const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
const dlRegex = /^[A-Z]{2}\d{2}\s?\d{11}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;

export const assignOrderSchema = z.object({
  params: z.object({ orderId: z.string().min(12) })
});

export const acceptAssignmentSchema = z.object({
  params: z.object({ orderId: z.string().min(12) })
});

export const updateDeliveryStatusSchema = z.object({
  params: z.object({ orderId: z.string().min(12) }),
  body: z.object({ status: z.enum(["PICKED_UP", "DELIVERED"]) })
});

export const updateLocationSchema = z.object({
  body: z.object({ coordinates: z.tuple([z.number(), z.number()]) })
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isOnline: z.boolean(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  })
});

const bankDetailsSchema = z.object({
  accountHolderName: z.string().trim().min(3),
  bankName: z.string().trim().min(3),
  accountNumber: z.string().trim().regex(/^\d{9,18}$/),
  ifscCode: z.string().trim().toUpperCase().regex(ifscRegex),
});

export const registerDeliverySchema = z
  .object({
    body: z.object({
      fullName: z.string().trim().min(3),
      phoneNumber: z.string().trim().regex(/^[6-9]\d{9}$/),
      email: z.string().trim().email(),
      profilePhoto: z.string().trim().min(3),
      vehicleType: z.enum(["Bike", "Cycle", "Car"]),
      vehicleFuelType: z.enum(["Petrol", "EV"]),
      bikeNumber: z.string().trim().toUpperCase().regex(vehicleNumberRegex),
      drivingLicense: z.string().trim().toUpperCase().regex(dlRegex),
      documents: z.object({
        aadhaarNumber: z.string().trim().regex(/^\d{12}$/),
        aadhaarPhoto: z.string().trim().min(3),
        panNumber: z.string().trim().toUpperCase().regex(panRegex),
        panPhoto: z.string().trim().min(3),
        drivingLicenseNumber: z.string().trim().toUpperCase().regex(dlRegex),
        drivingLicensePhoto: z.string().trim().min(3),
        vehicleRcNumber: z.string().trim().toUpperCase().regex(vehicleNumberRegex),
        vehicleRcPhoto: z.string().trim().min(3),
        bikeInsurancePhoto: z.string().trim().min(3),
        profilePhoto: z.string().trim().min(3),
        livePhoto: z.string().trim().min(3),
      }),
      address: z.object({
        buildingName: z.string().trim().min(2),
        streetName: z.string().trim().min(2),
        landmark: z.string().trim().optional().default(""),
        area: z.string().trim().min(2),
        state: z.string().trim().min(2),
        city: z.string().trim().min(2),
      }),
      payoutMethod: z.enum(["UPI", "BANK_ACCOUNT"]),
      upiId: z.string().trim().optional(),
      bankDetails: bankDetailsSchema.optional(),
      termsAccepted: z.literal(true),
    }),
  })
  .superRefine((payload, ctx) => {
    const body = payload.body;

    if (body.payoutMethod === "UPI") {
      if (!body.upiId || !upiRegex.test(body.upiId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "upiId"],
          message: "A valid UPI ID is required",
        });
      }
      return;
    }

    if (!body.bankDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "bankDetails"],
        message: "Bank details are required",
      });
    }
  });

export const getOrderDetailSchema = z.object({
  params: z.object({ orderId: z.string().min(12) })
});

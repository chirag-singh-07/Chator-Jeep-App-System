import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/errors/app-error";

export const autocomplete = asyncHandler(async (req: Request, res: Response) => {
  const { input } = req.query;
  if (!input) {
    throw new AppError("Input query parameter is required", 400);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new AppError("Google Maps API key is not configured", 500);
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input as string
  )}&key=${apiKey}&components=country:in`;

  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
});

export const placeDetails = asyncHandler(async (req: Request, res: Response) => {
  const { place_id } = req.query;
  if (!place_id) {
    throw new AppError("place_id query parameter is required", 400);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new AppError("Google Maps API key is not configured", 500);
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}&fields=geometry,address_component,formatted_address,name`;

  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
});

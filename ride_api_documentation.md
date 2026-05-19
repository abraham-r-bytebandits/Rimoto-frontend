# Ride Submission API Documentation

This document explains how to interact with the updated **Ride Submission Endpoint** from the frontend. The endpoint now supports uploading multiple images for a single ride using `multipart/form-data`.

## Endpoint Details

- **URL:** `POST /api/v1/public/rides`
- **Content-Type:** `multipart/form-data`
- **Authentication:** Currently public, but requires a valid `organizerId`.

---

## Request Payload (Form Data)

Since the endpoint expects file uploads alongside text data, you **cannot** send a standard JSON body. You must use the `FormData` API.

### Text Fields (Required)

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The title of the ride (e.g., "Sunday Morning Cruise"). |
| `startLocation` | `string` | The starting point of the ride. |
| `endLocation` | `string` | The destination of the ride. |
| `dateScheduled` | `string` (ISO date) | The date the ride is scheduled for. |
| `timeStart` | `string` | The starting time (e.g., "06:30 AM"). |
| `distanceKm` | `number` / `string`| The total distance of the ride in kilometers. |
| `skillLevel` | `string` | ENUM: `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`. |
| `bikeRequirement` | `string` | Text describing the bike type (e.g., "Any Bike"). |
| `whatsappGroupUrl`| `string` | Link to the WhatsApp group for the ride. |
| `organizerId` | `string` | The UUID of the user organizing the ride. |

### File Uploads (Optional, but supported)

| Field | Type | Description |
| :--- | :--- | :--- |
| `images` | `File[]` | Up to **5 image files** (JPEG, PNG, WEBP, etc.). Max size: 5MB per image. |

---

## Frontend Implementation Example

Here is a typical implementation in React / Next.js using `fetch`:

```typescript
async function submitRideData(rideDetails: any, selectedFiles: File[]) {
  // 1. Initialize FormData
  const formData = new FormData();

  // 2. Append all text fields
  formData.append('title', rideDetails.title);
  formData.append('startLocation', rideDetails.startLocation);
  formData.append('endLocation', rideDetails.endLocation);
  formData.append('dateScheduled', rideDetails.dateScheduled);
  formData.append('timeStart', rideDetails.timeStart);
  formData.append('distanceKm', rideDetails.distanceKm.toString());
  formData.append('skillLevel', rideDetails.skillLevel);
  formData.append('bikeRequirement', rideDetails.bikeRequirement || 'Any Bike');
  formData.append('whatsappGroupUrl', rideDetails.whatsappGroupUrl);
  formData.append('organizerId', rideDetails.organizerId);

  // 3. Append multiple files to the 'images' key
  if (selectedFiles && selectedFiles.length > 0) {
    selectedFiles.forEach((file) => {
      // NOTE: The field name MUST be 'images' to match the backend multer config:
      // uploadRideImage.array('images', 5)
      formData.append('images', file);
    });
  }

  // 4. Send the request
  try {
    const response = await fetch('http://localhost:4000/api/v1/public/rides', {
      method: 'POST',
      // NOTE: Do NOT set the 'Content-Type' header manually when using FormData!
      // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Ride created successfully with ID:', data.id);
    } else {
      console.error('Error creating ride:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Response

**Success Response (201 Created):**
```json
{
  "ok": true,
  "id": "e0a7f14b-6101-49fa-9fb1-817a3a3b5a15"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: title, startLocation, endLocation, dateScheduled, timeStart, skillLevel, whatsappGroupUrl, organizerId"
}
```

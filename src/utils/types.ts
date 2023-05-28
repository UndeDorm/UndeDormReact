export interface BasicUser {
  firstName: string;
  lastName: string;
  isOwner: boolean;
  id: string;
  dateOfBirth: number;
  email: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  images: string[];
  description: string;
  ownerId: string;
}

export interface Room {
  id: string;
  name: string;
  benefits: string;
  pricePerNight: number;
  beds: number;
  hotelId: string;
  images: string[];
}

export interface ReservationRequest {
  id: string;
  requestStatus: ReservationStatus;
  roomId: string;
  ownerId: string;
  userId: string;
  startDate: number;
  endDate: number;
}

export interface Reservation {
  id: string;
  reservationStatus: ReservationStatus;
  reservationRequestId: string;
}

export interface Message {
  reservationId: string;
  senderId: string;
  timestamp: number;
  text: string;
}

export type ReservationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled';

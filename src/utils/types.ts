export interface BasicUser {
  firstName: string;
  lastName: string;
  isOwner: boolean;
  id: string;
  dateOfBirth: number;
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
  benefits: string[];
  pricePerNight: number;
  beds: number;
  hotelId: string;
}

export interface ReservationRequest {
  id: string;
  requestStatus: ReservationStatus;
  roomId: string;
  hotelId: string;
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

export type ReservationStatus = 'pending' | 'accepted' | 'rejected';

export interface Address {
  division: string;
  district: string;
  area: string;
  detailedAddress: string;
}

export interface UserProfile {
  _id: string;
  firebaseUid: string;
  username: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  profileImage?: string;
  defaultAddress?: Address;
  role: "customer" | "super_admin" | "order_manager";
}

export interface AdminCustomer {
  _id: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
  lastOrderAt: string | null;
}

export interface Moderator {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: "super_admin" | "order_manager";
  createdAt: string;
}

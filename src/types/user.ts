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

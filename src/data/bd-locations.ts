// Bangladesh's 8 divisions and 64 districts, used for the checkout/profile
// address form's division + district typeahead (Section 18 of the guidelines).

export interface Division {
  name: string;
  districts: string[];
}

export const BD_DIVISIONS: Division[] = [
  {
    name: "Barisal",
    districts: ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  },
  {
    name: "Chattogram",
    districts: [
      "Bandarban",
      "Brahmanbaria",
      "Chandpur",
      "Chattogram",
      "Cumilla",
      "Cox's Bazar",
      "Feni",
      "Khagrachari",
      "Lakshmipur",
      "Noakhali",
      "Rangamati",
    ],
  },
  {
    name: "Dhaka",
    districts: [
      "Dhaka",
      "Faridpur",
      "Gazipur",
      "Gopalganj",
      "Kishoreganj",
      "Madaripur",
      "Manikganj",
      "Munshiganj",
      "Narayanganj",
      "Narsingdi",
      "Rajbari",
      "Shariatpur",
      "Tangail",
    ],
  },
  {
    name: "Khulna",
    districts: [
      "Bagerhat",
      "Chuadanga",
      "Jashore",
      "Jhenaidah",
      "Khulna",
      "Kushtia",
      "Magura",
      "Meherpur",
      "Narail",
      "Satkhira",
    ],
  },
  {
    name: "Mymensingh",
    districts: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  },
  {
    name: "Rajshahi",
    districts: ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj"],
  },
  {
    name: "Rangpur",
    districts: [
      "Dinajpur",
      "Gaibandha",
      "Kurigram",
      "Lalmonirhat",
      "Nilphamari",
      "Panchagarh",
      "Rangpur",
      "Thakurgaon",
    ],
  },
  {
    name: "Sylhet",
    districts: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  },
];

export const ALL_BD_DISTRICTS: string[] = BD_DIVISIONS.flatMap((d) => d.districts).sort();

export function districtsForDivision(division: string): string[] {
  return BD_DIVISIONS.find((d) => d.name === division)?.districts ?? [];
}

// "Inside Dhaka" delivery zone (Section 20a) applies only to the Dhaka *district*,
// not the wider Dhaka *division* — Gazipur, Narayanganj, etc. are "Outside Dhaka".
export function deliveryZoneForDistrict(district: string): "inside_dhaka" | "outside_dhaka" {
  return district === "Dhaka" ? "inside_dhaka" : "outside_dhaka";
}

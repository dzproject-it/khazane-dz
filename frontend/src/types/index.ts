export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  category?: Category;
  unitOfMeasure: string;
  barcode?: string;
  isActive: boolean;
  customFieldValues?: CustomFieldValue[];
  stockLevels?: StockLevel[];
  createdAt: string;
}

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  depthLevel: number;
  children?: Category[];
}

export interface CustomFieldDef {
  id: string;
  name: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT';
  isRequired: boolean;
  appliesToCategoryId?: string;
  options?: CustomFieldOption[];
}

export interface CustomFieldOption {
  id: string;
  label: string;
  sortOrder: number;
}

export interface CustomFieldValue {
  id: string;
  fieldDefId: string;
  fieldDef?: CustomFieldDef;
  valueText?: string;
  valueNumber?: number;
  valueDate?: string;
  option?: CustomFieldOption;
}

export interface Site {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'OTHER';
  address?: string;
  isActive: boolean;
  zones?: Zone[];
}

export interface Zone {
  id: string;
  siteId: string;
  code: string;
  name: string;
  type: 'AISLE' | 'SHELF' | 'AREA' | 'OTHER';
  locations?: Location[];
}

export interface Location {
  id: string;
  zoneId: string;
  code: string;
  label?: string;
  maxCapacity?: number;
}

export interface StockLevel {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  reservedQty: number;
  location?: Location & { zone?: Zone & { site?: Site } };
  product?: Product;
}

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  reference: string;
  type: MovementType;
  productId: string;
  product?: Pick<Product, 'sku' | 'name'>;
  sourceLocation?: Location & { zone?: Zone & { site?: Site } };
  destLocation?: Location & { zone?: Zone & { site?: Site } };
  quantity: number;
  reason?: string;
  performer?: Pick<User, 'name' | 'email'>;
  client?: { id: string; code: string; name: string };
  supplier?: { id: string; code: string; name: string };
  createdAt: string;
}

export type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  currentQty: number;
  status: AlertStatus;
  triggeredAt: string;
  threshold?: {
    product?: Pick<Product, 'sku' | 'name'>;
    site?: Pick<Site, 'name'>;
    minQuantity: number;
    safetyQuantity: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  isActive: boolean;
  products?: { product: Pick<Product, 'id' | 'sku' | 'name'> }[];
  createdAt: string;
}

export type ClientType = 'COMPANY' | 'INDIVIDUAL' | 'GOVERNMENT' | 'OTHER';

export interface Client {
  id: string;
  code: string;
  name: string;
  type: ClientType;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  isActive: boolean;
  _count?: { movements: number };
  createdAt: string;
}

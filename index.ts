export interface FileType {
  id: string;
  filename: string;
  fullName: string;
  downloadURL: string;
  type: string;
  size: number;
  folderId: string | null;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
} 
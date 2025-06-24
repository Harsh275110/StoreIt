'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db, storage } from '../lib/firebase/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { FolderType, FileType } from '../types';
import { 
  ArrowLeftIcon, 
  ArrowUpTrayIcon, 
  FolderPlusIcon, 
  TrashIcon, 
  ArrowRightOnRectangleIcon,
  DocumentIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles);
      }
    },
  });

  // Fetch files and folders on component mount or when currentFolder changes
  useEffect(() => {
    if (user) {
      fetchFilesAndFolders();
    }
  }, [user, currentFolder]);

  // Add debug logging on component mount
  useEffect(() => {
    console.log('Firebase Storage instance:', storage);
    console.log('Firebase Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    console.log('Auth state:', user ? 'Logged in' : 'Not logged in');
    
    // Enhanced diagnostics
    if (user) {
      console.log('User ID for files/folders:', user.uid);
      console.log('User email:', user.email);
    }
    
    // Check if storage is properly initialized
    if (!storage || !storage.app) {
      console.error('Firebase Storage not properly initialized!');
    } else {
      console.log('Firebase Storage initialized with bucket:', 
        storage.app.options.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    }
  }, [user]);

  const fetchFilesAndFolders = async () => {
    if (!user) return;

    try {
      // Fetch folders
      const folderQuery = query(
        collection(db, 'folders'),
        where('userId', '==', user.uid),
        where('parentId', '==', currentFolder),
        orderBy('name')
      );
      const folderSnapshot = await getDocs(folderQuery);
      const folderList = folderSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FolderType[];
      setFolders(folderList);

      // Fetch files
      const fileQuery = query(
        collection(db, 'files'),
        where('userId', '==', user.uid),
        where('folderId', '==', currentFolder),
        orderBy('createdAt', 'desc')
      );
      const fileSnapshot = await getDocs(fileQuery);
      const fileList = fileSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as FileType[];
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files and folders:', error);
      toast.error('Error fetching files and folders');
    }
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }
    
    // Verify storage is initialized
    if (!storage || !storage.app) {
      console.error('Firebase Storage not properly initialized!');
      toast.error('Storage not properly initialized');
      return;
    }
    
    setUploadLoading(true);
    
    try {
      console.log('Starting file upload process...');
      console.log('Files to upload:', acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      for (const file of acceptedFiles) {
        try {
          console.log(`Processing file: ${file.name}`);
          
          // More detailed reference logging
          const storagePath = `files/${user.uid}/${Date.now()}_${file.name}`;
          console.log('Storage path:', storagePath);
          
          const storageRef = ref(storage, storagePath);
          console.log('Storage reference created:', storageRef);
          console.log('Storage reference details:', {
            bucket: storageRef.bucket,
            fullPath: storageRef.fullPath,
            name: storageRef.name,
            parent: storageRef.parent ? storageRef.parent.fullPath : 'none'
          });
          
          // Upload file to Firebase Storage with more error handling
          console.log('Attempting to upload to Firebase Storage...');
          try {
            const uploadResult = await uploadBytes(storageRef, file);
            console.log('Upload successful:', uploadResult);
          } catch (uploadError: any) {
            console.error('Upload error:', uploadError);
            console.error('Upload error code:', uploadError.code);
            console.error('Upload error message:', uploadError.message);
            throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
          }
          
          // Get download URL with error handling
          console.log('Getting download URL...');
          let downloadURL;
          try {
            downloadURL = await getDownloadURL(storageRef);
            console.log('Download URL obtained:', downloadURL);
          } catch (urlError: any) {
            console.error('Download URL error:', urlError);
            throw new Error(`Failed to get download URL: ${urlError.message || 'Unknown error'}`);
          }
          
          // Add file metadata to Firestore
          console.log('Adding metadata to Firestore...');
          const docRef = await addDoc(collection(db, 'files'), {
            filename: file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name,
            fullName: file.name,
            downloadURL,
            type: file.type,
            size: file.size,
            folderId: currentFolder,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log('Firestore document created:', docRef.id);
        } catch (individualFileError: any) {
          console.error(`Error processing file ${file.name}:`, individualFileError);
          toast.error(`Error with file ${file.name}: ${individualFileError.message}`);
          // Continue with next file instead of stopping the whole upload
        }
      }
      
      toast.success('File(s) uploaded successfully!');
      fetchFilesAndFolders();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      // More detailed error logging
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        toast.error('Permission denied. Check Firebase Storage rules');
      } else if (error.code === 'storage/canceled') {
        toast.error('Upload canceled');
      } else if (error.code === 'storage/invalid-argument') {
        toast.error('Invalid storage configuration');
      } else if (error.code === 'storage/unknown') {
        toast.error('Unknown storage error. Check browser console');
      } else {
        toast.error(`Error uploading file: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    
    try {
      await addDoc(collection(db, 'folders'), {
        name: newFolderName,
        parentId: currentFolder,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setNewFolderName('');
      setShowNewFolderInput(false);
      toast.success('Folder created successfully!');
      fetchFilesAndFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Error creating folder');
    }
  };

  const handleDeleteFile = async (fileId: string, storageUrl: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));
      
      // Delete from Storage
      try {
        const storageRef = ref(storage, storageUrl);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('Storage delete error (file may already be deleted):', storageError);
      }
      
      toast.success('File deleted successfully!');
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // Check if folder is empty
      const fileQuery = query(
        collection(db, 'files'),
        where('folderId', '==', folderId)
      );
      const fileSnapshot = await getDocs(fileQuery);
      
      const subfolderQuery = query(
        collection(db, 'folders'),
        where('parentId', '==', folderId)
      );
      const subfolderSnapshot = await getDocs(subfolderQuery);
      
      if (!fileSnapshot.empty || !subfolderSnapshot.empty) {
        return toast.error('Cannot delete non-empty folder');
      }
      
      // Delete the folder
      await deleteDoc(doc(db, 'folders', folderId));
      
      toast.success('Folder deleted successfully!');
      setFolders(folders.filter(folder => folder.id !== folderId));
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Error deleting folder');
    }
  };

  const handleFolderClick = (folderId: string) => {
    setFolderHistory([...folderHistory, currentFolder || 'root']);
    setCurrentFolder(folderId);
  };

  const handleBackClick = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const previousFolder = newHistory.pop() || 'root';
      setFolderHistory(newHistory);
      setCurrentFolder(previousFolder === 'root' ? null : previousFolder);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">StoreIt</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200"
              >
                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Actions bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackClick}
              disabled={folderHistory.length === 0}
              className={`inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:bg-gray-200 ${
                folderHistory.length === 0 ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </button>
            
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button
                disabled={uploadLoading}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-100 px-3 py-2 text-sm font-medium leading-4 text-primary-700 hover:bg-primary-200"
              >
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                {uploadLoading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
            
            {showNewFolderInput ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="mr-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <button
                  onClick={handleCreateFolder}
                  className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-3 py-2 text-sm font-medium leading-4 text-green-700 hover:bg-green-200"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }}
                  className="ml-2 inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-3 py-2 text-sm font-medium leading-4 text-green-700 hover:bg-green-200"
              >
                <FolderPlusIcon className="mr-2 h-4 w-4" />
                New Folder
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {currentFolder 
              ? `Current folder: ${folders.find(f => f.id === currentFolder)?.name || 'Unknown'}`
              : 'Root folder'}
          </div>
        </div>
        
        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-medium text-gray-900">Folders</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
                >
                  <div 
                    className="mb-4 cursor-pointer" 
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <div className="flex items-center">
                      <FolderIcon className="mr-2 h-8 w-8 text-yellow-500" />
                      <h3 className="truncate text-lg font-medium text-gray-900">{folder.name}</h3>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(folder.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="invisible rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 group-hover:visible"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Files */}
        <div>
          <h2 className="mb-3 text-lg font-medium text-gray-900">Files</h2>
          {files.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="mb-2 flex items-center">
                      <DocumentIcon className="mr-2 h-8 w-8 text-blue-500" />
                      <h3 className="truncate text-lg font-medium text-gray-900">{file.filename}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={file.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.downloadURL)}
                      className="invisible rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 group-hover:visible"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-sm text-gray-500">
                No files in this folder. Upload a file or create a folder.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 
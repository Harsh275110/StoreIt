// A simple mock implementation of Firebase Storage using localStorage
// This allows for file uploads without Firebase Storage

class MockStorage {
  // Store files in memory during session
  private files: Map<string, { content: string, url: string, metadata: any }> = new Map();
  
  // Mock upload function
  async uploadFile(path: string, file: File): Promise<{ url: string, metadata: any }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          // Generate a mock URL
          const url = `mock://${path}`;
          
          // Create file metadata
          const metadata = {
            name: file.name,
            size: file.size,
            contentType: file.type,
            fullPath: path,
            timeCreated: new Date().toISOString()
          };
          
          // Store the file content (as base64 for binaries)
          this.files.set(path, {
            content: reader.result as string,
            url,
            metadata
          });
          
          // Persist paths to localStorage (not contents, as they could be large)
          this.savePaths();
          
          resolve({ url, metadata });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read the file as DataURL (for binary files)
      reader.readAsDataURL(file);
    });
  }
  
  // Get a download URL for a file
  async getDownloadURL(path: string): Promise<string> {
    const file = this.files.get(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    return file.url;
  }
  
  // Delete a file
  async deleteFile(path: string): Promise<void> {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    
    this.files.delete(path);
    this.savePaths();
  }
  
  // Save paths to localStorage
  private savePaths(): void {
    const paths = Array.from(this.files.keys());
    localStorage.setItem('mockStorage_paths', JSON.stringify(paths));
  }
  
  // Load paths from localStorage (we don't store file contents for space reasons)
  loadFromStorage(): void {
    try {
      const pathsJson = localStorage.getItem('mockStorage_paths');
      if (pathsJson) {
        const paths = JSON.parse(pathsJson);
        // Recreate empty entries for known paths
        paths.forEach((path: string) => {
          if (!this.files.has(path)) {
            this.files.set(path, {
              content: '',
              url: `mock://${path}`,
              metadata: { fullPath: path }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading mock storage paths:', error);
    }
  }
}

// Create and export a singleton instance
const mockStorage = new MockStorage();
mockStorage.loadFromStorage();

export default mockStorage; 
import api from '@/config/api';

export interface UploadResponse {
  url: string;
  message: string;
}

export const uploadService = {
  async uploadRestaurantImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/restaurant', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async uploadMenuItemImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/menu-item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async deleteFile(fileUrl: string): Promise<void> {
    await api.delete('/upload', {
      params: { url: fileUrl },
    });
  },

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  },
};

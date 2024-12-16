import React from 'react';
import FileUploadField from '../components/FileUploadField';

const Admin: React.FC = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Upload Job Descriptions for evaluation.</p>
      <FileUploadField />
    </div>
  );
};

export default Admin;

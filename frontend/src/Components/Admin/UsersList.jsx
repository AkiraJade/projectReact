import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { getAdminConfig } from '../../Utils/helpers';
import { exportToCsv } from '../../Utils/exportCsv';

const UsersList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);
  let navigate = useNavigate();

  const listUsers = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config);
      setAllUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, config);
      setIsDeleted(data.success);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message, { position: 'bottom-right' });
      setLoading(false);
    }
  };

  useEffect(() => {
    listUsers();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'bottom-right' });
      setError('');
    }
    if (isDeleted) {
      toast.success('Customer account deactivated and moved to Trash', { position: 'bottom-right' });
      setIsDeleted(false);
      listUsers();
    }
  }, [error, isDeleted]);

  const deleteUserHandler = (id, name) => {
    if (window.confirm(`Deactivate account for "${name}" and move to Trash? Customer won't be able to log in, but transaction history is preserved.`)) {
      deleteUser(id);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Customer Name',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '100%' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              borderRadius: '4px',
              background: '#101828',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12.5px',
              fontWeight: 700,
              fontFamily: 'var(--ds-font-grotesk, sans-serif)',
              letterSpacing: '0.04em',
              flexShrink: 0
            }}
          >
            {params.value?.[0]?.toUpperCase() || 'U'}
          </div>
          <strong style={{ color: '#101828', fontSize: '13.5px', fontWeight: 600 }}>{params.value}</strong>
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <span style={{ color: '#475467', fontSize: '13px' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value === 'admin' ? (
          <span className="ds-table-badge ds-badge-warning">
            <span className="ds-table-badge-dot"></span>
            ADMIN
          </span>
        ) : (
          <span className="ds-table-badge ds-badge-neutral">
            <span className="ds-table-badge-dot"></span>
            RIDER
          </span>
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 190,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
          <Link
            to={`/admin/user/${params.id}`}
            className="ds-table-action-btn ds-table-btn-edit"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => deleteUserHandler(params.id, params.row.name)}
            className="ds-table-action-btn ds-table-btn-trash"
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  const rows = allUsers.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  const handleExportCSV = () => {
    const exportColumns = [
      { label: 'User ID', key: '_id' },
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Role', key: (u) => (u.role || 'user').toUpperCase() },
      { label: 'Account Status', key: (u) => u.status || 'active' },
      { label: 'Email Verified', key: (u) => u.isVerified ? 'Yes' : 'No' },
      { label: 'Registration Date', key: (u) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '' },
    ];
    exportToCsv('riders_accounts_directory', exportColumns, allUsers);
  };

  return (
    <div className="ds-card ds-admin-table-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Customers Directory — DOSNOVENTA" />

      {/* Header and Sub-Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#101828',
            margin: 0,
            fontFamily: 'var(--ds-font-grotesk, sans-serif)',
            letterSpacing: '0.02em'
          }}>
            Registered Riders & Accounts ({allUsers.length})
          </h2>
          <p style={{ fontSize: '12.5px', color: '#667085', margin: '3px 0 0' }}>
            Registered atelier accounts, permissions, and security roles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '0 14px',
              height: '36px',
              fontSize: '11.5px',
              fontWeight: 600,
              fontFamily: 'var(--ds-font-grotesk, sans-serif)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderRadius: '4px',
              background: '#FFFFFF',
              border: '1px solid #D0D5DD',
              color: '#344054',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Export accounts directory as CSV"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Print CSV
          </button>
          <Link
            to="/admin/trash"
            className="ds-table-action-btn ds-table-btn-edit"
            style={{ padding: '8px 16px', fontSize: '11.5px', height: '36px' }}
          >
            Trash & Archived
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : (
        <Box className="ds-datagrid-container">
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={72}
            columnHeaderHeight={48}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
          />
        </Box>
      )}
    </div>
  );
};

export default UsersList;

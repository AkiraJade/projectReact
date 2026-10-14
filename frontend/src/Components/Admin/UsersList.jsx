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
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#222',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {params.value?.[0]?.toUpperCase() || 'U'}
          </div>
          <strong style={{ color: '#111827', fontSize: '13px' }}>{params.value}</strong>
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1.5,
      renderCell: (params) => (
        <span style={{ color: '#4B5563', fontSize: '13px' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: '12px',
            background: params.value === 'admin' ? '#FEF3C7' : '#F1F5F9',
            color: params.value === 'admin' ? '#92400E' : '#475569',
            border: `1px solid ${params.value === 'admin' ? '#FDE68A' : '#E2E8F0'}`,
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
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

  return (
    <div className="ds-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Customers Directory — DOSNOVENTA" />

      {/* Header and Sub-Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Registered Riders & Accounts ({allUsers.length})
          </h2>
          <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '3px 0 0' }}>
            Inspect atelier customer accounts, role authorizations, and soft-deactivation states.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/admin/trash"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#4B5563',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '6px',
            }}
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

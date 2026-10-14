import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';

const TrashList = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reviews' | 'users'
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ products: 0, reviews: 0, users: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog state for confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    actionType: null, // 'restore' | 'permanent' | 'bulkRestore'
    targetId: null,
    extraData: null,
  });

  const fetchTrashCounts = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/counts`, config);
      if (data.success && data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.warn('Failed to load trash counts');
    }
  };

  const fetchTrashItems = async (tab = activeTab) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const config = getAdminConfig();
      if (tab === 'products') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/products`, config);
        setProducts(data.products || []);
      } else if (tab === 'reviews') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/reviews`, config);
        setReviews(data.reviews || []);
      } else if (tab === 'users') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/users`, config);
        setUsers(data.users || []);
      }
      fetchTrashCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems(activeTab);
  }, [activeTab]);

  // Handle Restore
  const handleRestore = async (id, extra = null) => {
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      if (activeTab === 'products') {
        await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}/restore`, {}, config);
        toast.success('Product restored successfully', { position: 'bottom-right' });
      } else if (activeTab === 'reviews') {
        await axios.put(
          `${import.meta.env.VITE_API}/admin/review/restore?id=${id}&productId=${extra?.productId}`,
          {},
          config
        );
        toast.success('Review restored successfully', { position: 'bottom-right' });
      } else if (activeTab === 'users') {
        await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}/restore`, {}, config);
        toast.success('Customer account restored successfully', { position: 'bottom-right' });
      }
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore item', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Handle Permanent Delete
  const handlePermanentDelete = async (id, extra = null) => {
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      if (activeTab === 'products') {
        await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}/permanent`, config);
        toast.success('Product permanently deleted from database', { position: 'bottom-right' });
      } else if (activeTab === 'reviews') {
        await axios.delete(
          `${import.meta.env.VITE_API}/admin/review/permanent?id=${id}&productId=${extra?.productId}`,
          config
        );
        toast.success('Review permanently deleted', { position: 'bottom-right' });
      } else if (activeTab === 'users') {
        await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}/permanent`, config);
        toast.success('Customer account permanently deleted', { position: 'bottom-right' });
      }
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete permanently', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Handle Bulk Restore for Products
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      config.headers = { ...config.headers, 'Content-Type': 'application/json' };
      const { data } = await axios.put(
        `${import.meta.env.VITE_API}/admin/products/bulk/restore`,
        { ids: selectedIds },
        config
      );
      toast.success(data.message || `${selectedIds.length} item(s) restored`, { position: 'bottom-right' });
      setSelectedIds([]);
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk restore failed', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Column definitions for Products Trash
  const productColumns = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 1.5,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {params.row.image && (
            <img
              src={params.row.image}
              alt={params.value}
              style={{ width: '38px', height: '32px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #333' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: '13.5px' }}>{params.value}</span>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{params.row.category}</span>
          </div>
        </div>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>${params.value}</span>,
    },
    {
      field: 'deletedAt',
      headerName: 'Deleted Date',
      width: 140,
      renderCell: (params) => <span style={{ fontSize: '12.5px', color: '#4B5563' }}>{params.value}</span>,
    },
    {
      field: 'deletedBy',
      headerName: 'Deleted By',
      width: 160,
      renderCell: (params) => <span style={{ fontSize: '12.5px', color: '#4B5563' }}>{params.value || 'Administrator'}</span>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-view"
            title="Restore product to active collection"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Restore Product',
                message: `Are you sure you want to restore "${params.row.name}" back to the active catalog?`,
                actionType: 'restore',
                targetId: params.id,
              })
            }
          >
            Restore
          </button>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-trash"
            title="Permanently erase product"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Product',
                message: `WARNING: Are you sure you want to PERMANENTLY erase "${params.row.name}"? This operation cannot be undone.`,
                actionType: 'permanent',
                targetId: params.id,
              })
            }
          >
            Purge
          </button>
        </div>
      ),
    },
  ];

  // Column definitions for Reviews Trash
  const reviewColumns = [
    {
      field: 'productName',
      headerName: 'Product',
      width: 200,
      renderCell: (params) => <strong style={{ color: '#111827' }}>{params.value}</strong>,
    },
    {
      field: 'userName',
      headerName: 'Reviewer',
      width: 140,
      renderCell: (params) => <span style={{ color: '#374151' }}>{params.value}</span>,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 90,
      renderCell: (params) => <span style={{ color: '#D97706', fontWeight: 600 }}>★ {params.value}</span>,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 1.5,
      renderCell: (params) => <span style={{ fontSize: '12px', color: '#4B5563' }}>{params.value}</span>,
    },
    {
      field: 'deletedAt',
      headerName: 'Deleted Date',
      width: 130,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Restore Review',
                message: `Restore this review by ${params.row.userName} for "${params.row.productName}"?`,
                actionType: 'restore',
                targetId: params.id,
                extraData: { productId: params.row.productId },
              })
            }
            style={{ fontSize: '11px', padding: '3px 8px', borderColor: '#10b981', color: '#10b981' }}
          >
            RESTORE
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Review',
                message: 'Permanently remove this review from the system? This cannot be undone.',
                actionType: 'permanent',
                targetId: params.id,
                extraData: { productId: params.row.productId },
              })
            }
            style={{ fontSize: '11px', padding: '3px 8px', borderColor: '#ef4444', color: '#ef4444' }}
          >
            PURGE
          </button>
        </div>
      ),
    },
  ];

  // Column definitions for Customers Trash
  const userColumns = [
    {
      field: 'name',
      headerName: 'Customer Name',
      flex: 1,
      renderCell: (params) => <strong style={{ color: '#111827' }}>{params.value}</strong>,
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1.2,
      renderCell: (params) => <span style={{ fontFamily: 'monospace', color: '#374151' }}>{params.value}</span>,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: () => (
        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '2px', fontSize: '11px', letterSpacing: '1px' }}>
          DEACTIVATED
        </span>
      ),
    },
    {
      field: 'deletedAt',
      headerName: 'Deactivated On',
      width: 140,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Reactivate Customer Account',
                message: `Reactivate account for ${params.row.name} (${params.row.email})?`,
                actionType: 'restore',
                targetId: params.id,
              })
            }
            style={{ fontSize: '11px', padding: '3px 8px', borderColor: '#10b981', color: '#10b981' }}
          >
            REACTIVATE
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Account',
                message: `WARNING: Permanently delete ${params.row.name}'s account? Accounts with order records are strictly protected.`,
                actionType: 'permanent',
                targetId: params.id,
              })
            }
            style={{ fontSize: '11px', padding: '3px 8px', borderColor: '#ef4444', color: '#ef4444' }}
          >
            PURGE
          </button>
        </div>
      ),
    },
  ];

  // Row formatting
  const productRows = products.map((p) => ({
    id: p._id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.images?.[0]?.url || '',
    deletedAt: p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Recent',
    deletedBy: p.deletedBy?.name || p.deletedBy?.email || 'Admin',
  }));

  const reviewRows = reviews.map((r) => ({
    id: r._id,
    productId: r.productId,
    productName: r.productName,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    deletedAt: r.deletedAt ? new Date(r.deletedAt).toLocaleDateString() : 'Recent',
  }));

  const userRows = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    status: u.status || 'deactivated',
    deletedAt: u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : 'Recent',
  }));

  return (
    <div className="ds-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Trash & Recovery — DOSNOVENTA" />

      {/* Top Banner / Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Trash & Soft-Deleted Records
          </h2>
          <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '3px 0 0' }}>
            Safely restore items back to production or permanently purge unreferenced records.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              background: activeTab === 'products' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'products' ? '#111827' : '#64748B',
              border: 'none',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: activeTab === 'products' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Products ({counts.products || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              background: activeTab === 'reviews' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'reviews' ? '#111827' : '#64748B',
              border: 'none',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: activeTab === 'reviews' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Reviews ({counts.reviews || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              background: activeTab === 'users' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'users' ? '#111827' : '#64748B',
              border: 'none',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: activeTab === 'users' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Customers ({counts.users || 0})
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (for products) */}
      {activeTab === 'products' && selectedIds.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, p: 1.5, background: '#1c1f24', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '13px', color: '#fff', fontFamily: 'monospace' }}>
            {selectedIds.length} product(s) selected
          </span>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<RestoreFromTrashIcon />}
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Bulk Restore Products',
                message: `Are you sure you want to restore ${selectedIds.length} selected products back to the catalog?`,
                actionType: 'bulkRestore',
              })
            }
            disabled={actionLoading}
            sx={{ fontWeight: 700, letterSpacing: '1px' }}
          >
            {actionLoading ? 'RESTORING...' : `RESTORE SELECTED (${selectedIds.length})`}
          </Button>
        </Box>
      )}

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : (
        <Box className="ds-datagrid-container">
          {activeTab === 'products' && (
            <DataGrid
              rows={productRows}
              columns={productColumns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                if (newSelection && newSelection.ids) {
                  setSelectedIds(Array.from(newSelection.ids));
                } else if (Array.isArray(newSelection)) {
                  setSelectedIds(newSelection);
                } else {
                  setSelectedIds([]);
                }
              }}
              rowSelectionModel={{
                type: 'include',
                ids: new Set(selectedIds)
              }}
              autoHeight
            />
          )}

          {activeTab === 'reviews' && (
            <DataGrid
              rows={reviewRows}
              columns={reviewColumns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
            />
          )}

          {activeTab === 'users' && (
            <DataGrid
              rows={userRows}
              columns={userColumns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
            />
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null })}
        PaperProps={{
          sx: {
            backgroundColor: '#181b1f',
            color: '#f6f5f1',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '400px',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: confirmDialog.actionType === 'permanent' ? '#ef4444' : '#fff' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: 1.6 }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null })}
            sx={{ color: '#aaa', fontFamily: 'monospace' }}
            disabled={actionLoading}
          >
            CANCEL
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.actionType === 'restore') {
                handleRestore(confirmDialog.targetId, confirmDialog.extraData);
              } else if (confirmDialog.actionType === 'permanent') {
                handlePermanentDelete(confirmDialog.targetId, confirmDialog.extraData);
              } else if (confirmDialog.actionType === 'bulkRestore') {
                handleBulkRestore();
              }
            }}
            variant="contained"
            color={confirmDialog.actionType === 'permanent' ? 'error' : 'success'}
            disabled={actionLoading}
            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
          >
            {actionLoading ? 'PROCESSING...' : confirmDialog.actionType === 'permanent' ? 'CONFIRM PURGE' : 'CONFIRM RESTORE'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrashList;

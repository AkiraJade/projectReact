import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  let navigate = useNavigate();

  const getAdminProducts = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config);
      setProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminProducts();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'bottom-right' });
    }
    if (deleteError) {
      toast.error(deleteError, { position: 'bottom-right' });
    }
    if (isDeleted) {
      toast.success('Product(s) moved to Trash', { position: 'bottom-right' });
      setIsDeleted(false);
      setSelectedIds([]);
      getAdminProducts();
    }
  }, [error, deleteError, isDeleted]);

  const deleteProduct = async (id) => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, config);
      setIsDeleted(data.success);
      setLoading(false);
    } catch (error) {
      setDeleteError(error?.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const deleteProductHandler = (id, name) => {
    if (window.confirm(`Move "${name || 'this product'}" to Trash? You can restore it anytime from the Trash tab.`)) {
      deleteProduct(id);
    }
  };

  const bulkDeleteHandler = async () => {
    if (!selectedIds || selectedIds.length === 0) return;
    if (!window.confirm(`Move ${selectedIds.length} selected product(s) to Trash? You can restore them anytime from the Trash tab.`)) return;

    setBulkDeleting(true);
    try {
      const config = getAdminConfig();
      config.headers = { ...config.headers, 'Content-Type': 'application/json' };
      const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/products/bulk`, {
        ...config,
        data: { ids: selectedIds },
      });
      setBulkDeleting(false);
      setIsDeleted(true);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err.message);
      setBulkDeleting(false);
    }
  };

  const columns = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 2,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {params.row.image ? (
            <img
              src={params.row.image}
              alt={params.row.name}
              style={{ width: '44px', height: '38px', objectFit: 'cover', borderRadius: '4px', background: '#F3F4F6', border: '1px solid #E5E7EB' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: '44px', height: '38px', borderRadius: '4px', background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '10px' }}>
              NO IMG
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: '13.5px' }}>{params.row.name}</span>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{params.row.category}</span>
          </div>
        </div>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <strong style={{ fontFamily: 'monospace', color: '#111827', fontSize: '13.5px' }}>
          {params.value}
        </strong>
      ),
    },
    {
      field: 'stock',
      headerName: 'Inventory Status',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const qty = Number(params.value);
        return qty > 0 ? (
          <span style={{
            background: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            ● IN STOCK ({qty})
          </span>
        ) : (
          <span style={{
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            ○ OUT OF STOCK
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
          <Link
            to={`/admin/product/${params.id}`}
            className="ds-table-action-btn ds-table-btn-edit"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => deleteProductHandler(params.id, params.row.name)}
            title="Move to Trash"
            className="ds-table-action-btn ds-table-btn-trash"
          >
            Trash
          </button>
        </div>
      ),
    },
  ];

  const rows = products.map((product) => ({
    id: product._id,
    name: product.name,
    category: product.category,
    image: product.images?.[0]?.url || '',
    price: `$${Number(product.price).toFixed(2)}`,
    stock: product.stock,
  }));

  return (
    <div className="ds-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Products Catalog — DOSNOVENTA" />

      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Products Inventory ({products.length})
          </h2>
          <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '3px 0 0' }}>
            Manage catalog specifications, pricing, inventory stock, and atelier items.
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            View Trash
          </Link>
          <Link
            to="/admin/product"
            style={{
              background: '#C83226',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(200, 50, 38, 0.2)'
            }}
          >
            + Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {selectedIds.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, p: 1.5, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px' }}>
              <Button
                id="bulk-delete-btn"
                variant="contained"
                color="error"
                onClick={bulkDeleteHandler}
                disabled={bulkDeleting}
                size="small"
                sx={{ fontWeight: 600, fontSize: '11.5px', textTransform: 'none' }}
              >
                {bulkDeleting ? 'Moving to Trash...' : `Move Selected to Trash (${selectedIds.length})`}
              </Button>
              <span style={{ fontSize: '13px', color: '#991B1B', fontWeight: 500 }}>
                {selectedIds.length} item(s) selected
              </span>
            </Box>
          )}

          <Box className="ds-datagrid-container">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
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
              getRowId={(row) => row.id}
              autoHeight
            />
          </Box>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
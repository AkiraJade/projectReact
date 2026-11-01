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
      minWidth: 260,
      renderCell: (params) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          minWidth: 0,
          height: '100%'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {params.row.image ? (
              <img
                src={params.row.image}
                alt={params.row.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#98a2b3',
                letterSpacing: '0.05em',
                fontFamily: 'var(--ds-font-grotesk, sans-serif)'
              }}>
                NO IMG
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            overflow: 'hidden',
            lineHeight: 1.3
          }}>
            <span
              style={{
                fontWeight: 600,
                color: '#101828',
                fontSize: '13.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
              title={params.row.name}
            >
              {params.row.name}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#667085',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
            >
              {params.row.category || 'General'}
            </span>
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
        <span style={{
          fontFamily: 'var(--ds-font-grotesk, sans-serif)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          color: '#101828',
          fontSize: '14px'
        }}>
          {params.value}
        </span>
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
          <span className="ds-table-badge ds-badge-success">
            <span className="ds-table-badge-dot"></span>
            IN STOCK ({qty})
          </span>
        ) : (
          <span className="ds-table-badge ds-badge-danger">
            <span className="ds-table-badge-dot"></span>
            OUT OF STOCK
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
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
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
    <div className="ds-card ds-admin-table-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Products Catalog — DOSNOVENTA" />

      {/* Top Controls Bar */}
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
            Products Inventory ({products.length})
          </h2>
          <p style={{ fontSize: '12.5px', color: '#667085', margin: '3px 0 0' }}>
            Manage catalog specifications, pricing, inventory stock, and atelier items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/admin/trash"
            className="ds-table-action-btn ds-table-btn-edit"
            style={{ padding: '8px 16px', fontSize: '11.5px', height: '36px' }}
          >
            View Trash
          </Link>
          <Link
            to="/admin/product"
            style={{
              background: '#C83226',
              border: '1px solid #C83226',
              color: '#FFFFFF',
              padding: '0 18px',
              height: '36px',
              fontSize: '11.5px',
              fontWeight: 600,
              fontFamily: 'var(--ds-font-grotesk, sans-serif)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease'
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
              rowHeight={72}
              columnHeaderHeight={48}
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
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
// import { getToken } from '../../Utils/helpers';
// import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { newProduct, clearErrors } from '../../actions/productActions'
import { NEW_PRODUCT_RESET } from '../../constants/productConstants'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const productSchema = yup.object({
    name: yup.string().min(3, 'Name must be at least 3 characters').required('Product name is required'),
    price: yup.number().typeError('Price must be a number').min(1, 'Price must be greater than 0').required('Price is required'),
    description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
    stock: yup.number().typeError('Stock must be a number').min(0, 'Stock cannot be negative').required('Stock is required'),
    seller: yup.string().required('Seller name is required'),
});

const NewProduct = () => {
    const dispatch = useDispatch()
    const { loading, error, success } = useSelector(state => state.newProduct)

    const [category, setCategory] = useState('Bikes');
    const [isPublished, setIsPublished] = useState(true);
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: { category: 'Bikes', stock: 0, price: 0 }
    });

    const categories = [
        'Bikes',
        'Frames',
        'Components',
        'Apparel & Goods'
    ]

    let navigate = useNavigate()

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('price', data.price);
        formData.set('description', data.description);
        formData.set('category', category);
        formData.set('isPublished', isPublished);
        formData.set('stock', data.stock);
        formData.set('seller', data.seller);

        images.forEach(image => {
            formData.append('images', image)
        })

        dispatch(newProduct(formData))
    }

    const onChange = e => {
        const files = Array.from(e.target.files)
        setImagesPreview([]);
        setImages([])
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                    setImages(oldArray => [...oldArray, reader.result])
                }
            }

            reader.readAsDataURL(file)
            // console.log(reader)
        })

    }
    // const newProduct = async (formData) => {

    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',

    //             },
    //             withCredentials: true
    //         }

    //         const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config)
    //         setLoading(false)
    //         setSuccess(data.success)
    //         setProduct(data.product)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {

    //     if (error) {
    //         toast.error(error, {
    //             position: 'bottom-right'
    //         });
    //     }

    //     if (success) {
    //         navigate('/admin/products');
    //         toast.success('Product created successfully', {
    //             position: 'bottom-right'
    //         })

    //     }

    // }, [error, success,])
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (success) {
            navigate('/admin/products');
            toast.success('Product created successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: NEW_PRODUCT_RESET })

        }

    }, [error, dispatch, navigate, success])

    return (
        <div className="ds-admin-form-card" style={{ maxWidth: 780, margin: '0 auto' }}>
            <MetaData title={'New Product — DOSNOVENTA'} />
            <form onSubmit={handleSubmit(onSubmit)} encType='multipart/form-data'>
                <h2 className="ds-form-section-title">Configure & Publish Product</h2>

                <div className="ds-form-group">
                    <label htmlFor="name_field" className="ds-form-label">Product Name</label>
                    <input
                        type="text"
                        id="name_field"
                        className="ds-form-input"
                        placeholder="e.g. Dosnoventa Barcelona Steel Frameset"
                        {...register('name')}
                    />
                    {errors.name && <span className="ds-form-error">{errors.name.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="ds-form-group">
                        <label htmlFor="price_field" className="ds-form-label">Price ($ USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="price_field"
                            className="ds-form-input"
                            placeholder="0.00"
                            {...register('price')}
                        />
                        {errors.price && <span className="ds-form-error">{errors.price.message}</span>}
                    </div>

                    <div className="ds-form-group">
                        <label htmlFor="stock_field" className="ds-form-label">Inventory Quantity</label>
                        <input
                            type="number"
                            id="stock_field"
                            className="ds-form-input"
                            placeholder="0"
                            {...register('stock')}
                        />
                        {errors.stock && <span className="ds-form-error">{errors.stock.message}</span>}
                    </div>
                </div>

                <div className="ds-form-group">
                    <label htmlFor="description_field" className="ds-form-label">Engineering Specifications & Description</label>
                    <textarea 
                        className="ds-form-textarea" 
                        id="description_field" 
                        rows="5" 
                        placeholder="Enter metallurgical specs, geometry details, and craft overview..."
                        {...register('description')}
                    ></textarea>
                    {errors.description && <span className="ds-form-error">{errors.description.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="ds-form-group">
                        <label htmlFor="category_field" className="ds-form-label">Category</label>
                        <select 
                            className="ds-form-select" 
                            id="category_field" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ds-form-group">
                        <label htmlFor="publish_field" className="ds-form-label">Publishing Visibility</label>
                        <select
                            className="ds-form-select"
                            id="publish_field"
                            value={isPublished ? "published" : "draft"}
                            onChange={(e) => setIsPublished(e.target.value === "published")}
                        >
                            <option value="published">Published (Visible in Shop)</option>
                            <option value="draft">Draft / Unpublished (Archive only)</option>
                        </select>
                    </div>
                </div>

                <div className="ds-form-group">
                    <label htmlFor="seller_field" className="ds-form-label">Atelier Workshop / Seller</label>
                    <input
                        type="text"
                        id="seller_field"
                        className="ds-form-input"
                        placeholder="e.g. Dosnoventa Barcelona Atelier"
                        {...register('seller')}
                    />
                    {errors.seller && <span className="ds-form-error">{errors.seller.message}</span>}
                </div>

                <div className="ds-form-group">
                    <label className="ds-form-label">Product Imagery</label>
                    <div className="ds-file-dropzone" onClick={() => document.getElementById('customFile').click()}>
                        <input
                            type='file'
                            name='images'
                            id='customFile'
                            style={{ display: 'none' }}
                            onChange={onChange}
                            multiple
                        />
                        <div style={{ fontSize: '24px', color: '#6B7280', marginBottom: '6px' }}>📁</div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                            Click to upload product photography
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                            PNG, JPG or WebP images
                        </div>
                    </div>

                    {imagesPreview.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                            {imagesPreview.map((img, i) => (
                                <img 
                                    src={img} 
                                    key={i} 
                                    alt="Images Preview" 
                                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        style={{
                            padding: '11px 20px',
                            background: '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            color: '#374151',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        id="login_button"
                        type="submit"
                        className="ds-btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Publishing...' : 'Publish Product'}
                    </button>
                </div>
            </form>
        </div>
    )
}
export default NewProduct

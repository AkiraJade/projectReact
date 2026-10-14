import React from 'react'
import { Helmet } from 'react-helmet'

const MetaData = ({ title }) => {
    return (
        <Helmet>
            <title>{title ? `${title} — DOSNOVENTA` : 'DOSNOVENTA — Fixed Gear Bicycles'}</title>
        </Helmet>
    )
}

export default MetaData
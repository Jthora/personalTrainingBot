import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

const CardSlugRedirect: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [params] = useSearchParams();
    const source = params.get('source') ?? 'c';

    if (!slug) {
        return <Navigate to="/mission/triage" replace />;
    }

    const target = `/mission/triage?cardSlug=${encodeURIComponent(slug)}&source=${encodeURIComponent(source)}`;
    return <Navigate to={target} replace />;
};

export default CardSlugRedirect;

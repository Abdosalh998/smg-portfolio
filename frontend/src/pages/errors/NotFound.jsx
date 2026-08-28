import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import './NotFound.css';

const NotFound = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <div className="not-found-icon">
        <AlertTriangle size={48} />
      </div>
      <h1 className="not-found-code">404</h1>
      <h2 className="not-found-title">الصفحة غير موجودة</h2>
      <p className="not-found-message">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link to="/admin" className="btn btn-primary">
        <Home size={16} /> العودة للوحة التحكم
      </Link>
    </div>
  </div>
);

export default NotFound;

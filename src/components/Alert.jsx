const Alert = ({ type, message, onClose }) => {
  const bgColor = type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  
  useEffect(() => {
    if (onClose && message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, message]);

  return message ? (
    <div className={`mb-4 p-4 rounded-lg ${bgColor}`}>{message}</div>
  ) : null;
};

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled = false, 
  icon: Icon,
  type = "button",
  className = "" 
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <textarea
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const NavBar = ({ title, user, onLogout, onBack, children }) => (
  <nav className="bg-white shadow-lg sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {children}
          {user && (
            <>
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.role}
              </span>
              {onLogout && (
                <Button variant="danger" onClick={onLogout} icon={LogOut}>
                  Logout
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const StatCard = ({ title, value, subtitle, bgColor = "bg-blue-50", textColor = "text-blue-900" }) => (
  <div className={`${bgColor} p-6 rounded-lg`}>
    <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
    <p className={`${textColor.replace('900', '700')} mt-2 text-3xl font-bold`}>{value}</p>
    {subtitle && <p className={`${textColor.replace('900', '600')} text-sm`}>{subtitle}</p>}
  </div>
);
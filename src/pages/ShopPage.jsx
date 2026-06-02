import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiSearch,
  FiX,
  FiGrid,
  FiSliders,
} from 'react-icons/fi';
import products from '../data/products';
import categories from '../data/categories';
import brands from '../data/brands';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import './ShopPage.css';

// Predefined filter options
const GENDERS = ['Men', 'Women', 'Unisex'];
const SHAPES = ['Rectangular', 'Round', 'Aviator', 'Cat-Eye', 'Square', 'Oval'];
const MATERIALS = ['Acetate', 'Titanium', 'Metal', 'TR90'];
const LENS_TYPES = [
  'Blue Light Filter',
  'Progressive',
  'Single Vision',
  'Polarized',
  'Gradient',
  'Mirror',
  'Photochromic',
];

const PRICE_RANGES = [
  { label: 'Under $100', value: '0-100' },
  { label: '$100 - $200', value: '100-200' },
  { label: '$200 - $400', value: '200-400' },
  { label: 'Over $400', value: '400-9999' },
];

const COLORS = [
  { name: 'Navy', hex: '#1a1a2e' },
  { name: 'Charcoal', hex: '#2d3436' },
  { name: 'Brown', hex: '#8b4513' },
  { name: 'Gold', hex: '#c9a84c' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Blue', hex: '#4169e1' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, sorting and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedLensTypes, setSelectedLensTypes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Sidebar visibility for mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Collapsible filter sections states
  const [collapsibleStates, setCollapsibleStates] = useState({
    category: true,
    brand: true,
    gender: true,
    price: true,
    shape: true,
    material: true,
    lens: true,
    color: true,
  });

  // Toggle collapsible sections
  const toggleCollapsible = (section) => {
    setCollapsibleStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Sync Category from search query params (if user clicked a category on homepage)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Find category name by slug
      const cat = categories.find((c) => c.slug === categoryParam);
      if (cat) {
        setSelectedCategories([cat.name]);
      }
    }
  }, [searchParams]);

  // Handle Multi-checkbox toggles
  const handleCheckboxChange = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
    setCurrentPage(1); // Reset page on filter
  };

  const handleColorToggle = (colorHex) => {
    if (selectedColors.includes(colorHex)) {
      setSelectedColors(selectedColors.filter((hex) => hex !== colorHex));
    } else {
      setSelectedColors([...selectedColors, colorHex]);
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setSelectedPriceRanges([]);
    setSelectedShapes([]);
    setSelectedMaterials([]);
    setSelectedLensTypes([]);
    setSelectedColors([]);
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search text query matching
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category matching
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      // Brand matching
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(product.brand)
      ) {
        return false;
      }

      // Gender matching
      if (
        selectedGenders.length > 0 &&
        !selectedGenders.includes(product.gender)
      ) {
        return false;
      }

      // Frame Shape matching
      if (
        selectedShapes.length > 0 &&
        !selectedShapes.includes(product.frameShape)
      ) {
        return false;
      }

      // Frame Material matching
      if (
        selectedMaterials.length > 0 &&
        !selectedMaterials.includes(product.frameMaterial)
      ) {
        return false;
      }

      // Lens Type matching
      if (
        selectedLensTypes.length > 0 &&
        !selectedLensTypes.includes(product.lensType)
      ) {
        return false;
      }

      // Colors matching (checks if product colors array intersects with selectedColors hex list)
      if (selectedColors.length > 0) {
        const hasColor = product.colors.some((col) => selectedColors.includes(col));
        if (!hasColor) return false;
      }

      // Price range matching
      if (selectedPriceRanges.length > 0) {
        const inPriceRange = selectedPriceRanges.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return product.price >= min && product.price <= max;
        });
        if (!inPriceRange) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedGenders,
    selectedShapes,
    selectedMaterials,
    selectedLensTypes,
    selectedColors,
    selectedPriceRanges,
  ]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        // isNew first, then by id descending
        return list.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.id - a.id;
        });
    }
  }, [filteredProducts, sortBy]);

  // Pagination calculations
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const renderFilterCheckboxes = (options, activeList, setter, sectionName) => {
    return options.map((option) => (
      <label key={option} className="filter-checkbox-label">
        <input
          type="checkbox"
          checked={activeList.includes(option)}
          onChange={() => handleCheckboxChange(option, activeList, setter)}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">{option}</span>
      </label>
    ));
  };

  const SidebarContent = () => (
    <div className="shop-sidebar-content">
      <div className="sidebar-header-row">
        <h3>Filters</h3>
        {(selectedCategories.length > 0 ||
          selectedBrands.length > 0 ||
          selectedGenders.length > 0 ||
          selectedPriceRanges.length > 0 ||
          selectedShapes.length > 0 ||
          selectedMaterials.length > 0 ||
          selectedLensTypes.length > 0 ||
          selectedColors.length > 0 ||
          searchQuery) && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('category')}>
          <h4>Category</h4>
          {collapsibleStates.category ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.category && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(
              categories.map((c) => c.name),
              selectedCategories,
              setSelectedCategories,
              'category'
            )}
          </div>
        )}
      </div>

      {/* Brands Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('brand')}>
          <h4>Brand</h4>
          {collapsibleStates.brand ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.brand && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(
              brands.map((b) => b.name),
              selectedBrands,
              setSelectedBrands,
              'brand'
            )}
          </div>
        )}
      </div>

      {/* Genders Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('gender')}>
          <h4>Gender</h4>
          {collapsibleStates.gender ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.gender && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(GENDERS, selectedGenders, setSelectedGenders, 'gender')}
          </div>
        )}
      </div>

      {/* Price Ranges Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('price')}>
          <h4>Price Range</h4>
          {collapsibleStates.price ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.price && (
          <div className="filter-group-body">
            {PRICE_RANGES.map((range) => (
              <label key={range.value} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(range.value)}
                  onChange={() =>
                    handleCheckboxChange(range.value, selectedPriceRanges, setSelectedPriceRanges)
                  }
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Frame Shapes Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('shape')}>
          <h4>Frame Shape</h4>
          {collapsibleStates.shape ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.shape && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(SHAPES, selectedShapes, setSelectedShapes, 'shape')}
          </div>
        )}
      </div>

      {/* Frame Materials Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('material')}>
          <h4>Frame Material</h4>
          {collapsibleStates.material ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.material && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(MATERIALS, selectedMaterials, setSelectedMaterials, 'material')}
          </div>
        )}
      </div>

      {/* Lens Types Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('lens')}>
          <h4>Lens Type</h4>
          {collapsibleStates.lens ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.lens && (
          <div className="filter-group-body">
            {renderFilterCheckboxes(LENS_TYPES, selectedLensTypes, setSelectedLensTypes, 'lens')}
          </div>
        )}
      </div>

      {/* Colors Filter */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleCollapsible('color')}>
          <h4>Colors</h4>
          {collapsibleStates.color ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        {collapsibleStates.color && (
          <div className="filter-group-body color-swatches-grid">
            {COLORS.map((col) => (
              <button
                key={col.hex}
                className={`color-swatch-btn ${selectedColors.includes(col.hex) ? 'active' : ''}`}
                style={{ backgroundColor: col.hex }}
                onClick={() => handleColorToggle(col.hex)}
                title={col.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="shop-page page">
      {/* Banner */}
      <div className="shop-banner">
        <div className="container">
          <div className="shop-banner-content">
            <h1 className="shop-banner-title gradient-text">Our Collection</h1>
            <div className="shop-breadcrumbs">
              <Link to="/">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Shop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Layout controls */}
      <div className="shop-controls-bar">
        <div className="container">
          <div className="shop-controls-wrapper">
            <div className="search-bar-wrapper glass-card">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search premium styles, brands..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="mobile-filter-toggle-row">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="mobile-filter-trigger-btn"
              >
                <FiSliders /> Filters
              </Button>

              <div className="sort-wrapper">
                <span className="sort-label">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="sort-select glass-card"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="shop-main-section">
        <div className="container">
          <div className="shop-layout-grid">
            {/* Desktop Sidebar */}
            <aside className="shop-sidebar glass-card">{SidebarContent()}</aside>

            {/* Product Listing */}
            <div className="shop-product-pane">
              <div className="result-info-header">
                <p className="result-count">
                  Showing <span>{filteredProducts.length}</span> luxury styles
                </p>
              </div>

              {paginatedProducts.length > 0 ? (
                <motion.div layout className="shop-product-grid">
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="no-results-view glass-card">
                  <h3>No Styles Found</h3>
                  <p>We couldn't find any premium eyewear matching your current selection.</p>
                  <Button variant="primary" size="md" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    className="pagination-arrow"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    className="pagination-arrow"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filter Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              className="mobile-sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div
              className="mobile-sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="drawer-close-row">
                <h3>Filters</h3>
                <button
                  className="drawer-close-btn"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="drawer-scroll-body">{SidebarContent()}</div>
              <div className="drawer-action-row">
                <Button
                  variant="primary"
                  size="md"
                  className="drawer-apply-btn"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  Apply Filters ({filteredProducts.length})
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

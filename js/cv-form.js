// CV Form Management
class CVFormManager {
    constructor() {
        this.data = this.getDefaultData();
        this.selectedIndustry = '';
        this.selectedSkills = [];
        this.countryCode = '';
        this.phoneNumber = '';
        this.init();
    }

    // Country code data with validation rules
    getCountryCodeData() {
        return {
            '+260': { country: 'Zambia', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+27': { country: 'South Africa', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+254': { country: 'Kenya', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+255': { country: 'Tanzania', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+256': { country: 'Uganda', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+234': { country: 'Nigeria', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+233': { country: 'Ghana', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+1': { country: 'USA/Canada', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+44': { country: 'United Kingdom', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+33': { country: 'France', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+49': { country: 'Germany', minLength: 10, maxLength: 11, pattern: /^[0-9]{10,11}$/ },
            '+86': { country: 'China', minLength: 11, maxLength: 11, pattern: /^[0-9]{11}$/ },
            '+91': { country: 'India', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+81': { country: 'Japan', minLength: 10, maxLength: 11, pattern: /^[0-9]{10,11}$/ },
            '+61': { country: 'Australia', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+55': { country: 'Brazil', minLength: 10, maxLength: 11, pattern: /^[0-9]{10,11}$/ },
            '+52': { country: 'Mexico', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+7': { country: 'Russia', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+39': { country: 'Italy', minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ },
            '+34': { country: 'Spain', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+31': { country: 'Netherlands', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+46': { country: 'Sweden', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+47': { country: 'Norway', minLength: 8, maxLength: 8, pattern: /^[0-9]{8}$/ },
            '+41': { country: 'Switzerland', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+32': { country: 'Belgium', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+351': { country: 'Portugal', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+353': { country: 'Ireland', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+358': { country: 'Finland', minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ },
            '+45': { country: 'Denmark', minLength: 8, maxLength: 8, pattern: /^[0-9]{8}$/ },
            '+64': { country: 'New Zealand', minLength: 8, maxLength: 9, pattern: /^[0-9]{8,9}$/ },
            '+82': { country: 'South Korea', minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ },
            '+65': { country: 'Singapore', minLength: 8, maxLength: 8, pattern: /^[0-9]{8}$/ },
            '+60': { country: 'Malaysia', minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ },
            '+66': { country: 'Thailand', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+84': { country: 'Vietnam', minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ },
            '+62': { country: 'Indonesia', minLength: 9, maxLength: 11, pattern: /^[0-9]{9,11}$/ },
            '+63': { country: 'Philippines', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+971': { country: 'UAE', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+966': { country: 'Saudi Arabia', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ },
            '+20': { country: 'Egypt', minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ },
            '+212': { country: 'Morocco', minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ }
        };
    }

    // Format phone number with country code
    formatPhoneNumber(countryCode, phoneNumber) {
        if (!countryCode || !phoneNumber) return '';
        // Remove any spaces or dashes from phone number
        const cleaned = phoneNumber.replace(/[\s-]/g, '');
        // Format as: +260 976 123 456
        if (cleaned.length > 0) {
            // Add spaces every 3 digits for better readability
            const formatted = cleaned.match(/.{1,3}/g)?.join(' ') || cleaned;
            return `${countryCode} ${formatted}`;
        }
        return '';
    }

    // Validate phone number based on country code
    validatePhoneNumber(countryCode, phoneNumber) {
        if (!countryCode || !phoneNumber) return { valid: false, message: '' };
        
        const cleaned = phoneNumber.replace(/[\s-]/g, '');
        const countryData = this.getCountryCodeData()[countryCode];
        
        if (!countryData) return { valid: true, message: '' }; // No validation if country not in list
        
        if (cleaned.length < countryData.minLength) {
            return { 
                valid: false, 
                message: `Phone number must be at least ${countryData.minLength} digits for ${countryData.country}` 
            };
        }
        
        if (cleaned.length > countryData.maxLength) {
            return { 
                valid: false, 
                message: `Phone number must be at most ${countryData.maxLength} digits for ${countryData.country}` 
            };
        }
        
        if (!countryData.pattern.test(cleaned)) {
            return { 
                valid: false, 
                message: `Invalid phone number format for ${countryData.country}` 
            };
        }
        
        return { valid: true, message: '' };
    }

    // Update phone display and data
    updatePhoneDisplay() {
        const countryCodeInput = document.getElementById('cv-country-code');
        const phoneNumberInput = document.getElementById('cv-phone-number');
        const hiddenPhone = document.getElementById('cv-phone');
        
        if (!countryCodeInput || !phoneNumberInput) return;
        
        this.countryCode = countryCodeInput.value;
        this.phoneNumber = phoneNumberInput.value.trim();
        
        if (this.countryCode && this.phoneNumber) {
            const formatted = this.formatPhoneNumber(this.countryCode, this.phoneNumber);
            const validation = this.validatePhoneNumber(this.countryCode, this.phoneNumber);
            
            // Update hidden field with formatted phone
            if (hiddenPhone) {
                hiddenPhone.value = formatted;
                this.data.phone = formatted;
            }
            
            // Show validation message if invalid
            if (!validation.valid && phoneNumberInput) {
                phoneNumberInput.setCustomValidity(validation.message);
                phoneNumberInput.style.borderColor = '#EF4444';
            } else if (phoneNumberInput) {
                phoneNumberInput.setCustomValidity('');
                phoneNumberInput.style.borderColor = '';
            }
        } else {
            if (hiddenPhone) {
                hiddenPhone.value = '';
                this.data.phone = '';
            }
            if (phoneNumberInput) {
                phoneNumberInput.setCustomValidity('');
                phoneNumberInput.style.borderColor = '';
            }
        }
        
        // Update preview
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    // Initialize phone number handler
    initPhoneHandler() {
        this.initCountryCodeDropdown();
        const phoneNumberInput = document.getElementById('cv-phone-number');
        
        if (phoneNumberInput) {
            phoneNumberInput.addEventListener('input', () => {
                // Only allow digits, spaces, and dashes
                phoneNumberInput.value = phoneNumberInput.value.replace(/[^\d\s-]/g, '');
                this.updatePhoneDisplay();
            });
            
            phoneNumberInput.addEventListener('blur', () => {
                this.updatePhoneDisplay();
            });
        }
    }

    // Initialize searchable country code dropdown
    initCountryCodeDropdown() {
        const searchInput = document.getElementById('cv-country-code-search');
        const dropdown = document.getElementById('cv-country-code-dropdown');
        const list = document.getElementById('cv-country-code-list');
        const hiddenInput = document.getElementById('cv-country-code');
        const displayInput = document.getElementById('cv-country-code-display');
        
        if (!searchInput || !dropdown || !list || !hiddenInput) return;

        // Populate country list
        this.populateCountryList(list);

        // Track selected index for keyboard navigation
        let selectedIndex = -1;

        // Toggle dropdown
        const showDropdown = () => {
            dropdown.style.display = 'block';
            this.filterCountries('');
            selectedIndex = -1;
            searchInput.focus();
        };

        const hideDropdown = () => {
            dropdown.style.display = 'none';
            selectedIndex = -1;
        };

        searchInput.addEventListener('focus', showDropdown);
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdown.style.display === 'none') {
                showDropdown();
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.filterCountries(e.target.value);
            selectedIndex = -1;
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const items = list.querySelectorAll('.country-item:not([style*="display: none"])');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                this.highlightCountryItem(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                this.highlightCountryItem(items, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (e.key === 'Escape') {
                hideDropdown();
                searchInput.blur();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!displayInput.contains(e.target) && !dropdown.contains(e.target)) {
                hideDropdown();
            }
        });

        // Handle country selection
        list.addEventListener('click', (e) => {
            const countryItem = e.target.closest('.country-item');
            if (countryItem) {
                const code = countryItem.getAttribute('data-code');
                const country = countryItem.getAttribute('data-country');
                hiddenInput.value = code;
                searchInput.value = `${country} (${code})`;
                hideDropdown();
                this.countryCode = code;
                this.updatePhoneDisplay();
                // Move focus to phone number input for better UX
                const phoneInput = document.getElementById('cv-phone-number');
                if (phoneInput) {
                    setTimeout(() => phoneInput.focus(), 100);
                }
            }
        });
    }

    // Highlight country item for keyboard navigation
    highlightCountryItem(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.setAttribute('aria-selected', 'false');
            }
        });
    }

    // Populate country list
    populateCountryList(list) {
        if (typeof COUNTRY_CODES === 'undefined') {
            console.error('COUNTRY_CODES not loaded');
            return;
        }
        
        list.innerHTML = '';
        COUNTRY_CODES.forEach((country, index) => {
            const item = document.createElement('div');
            item.className = 'country-item';
            item.setAttribute('data-code', country.code);
            item.setAttribute('data-country', country.country);
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', 'false');
            item.setAttribute('tabindex', '-1');
            item.innerHTML = `<span class="country-name">${country.country}</span><span class="country-code">${country.code}</span>`;
            list.appendChild(item);
        });
    }

    // Filter countries based on search
    filterCountries(searchTerm) {
        const list = document.getElementById('cv-country-code-list');
        if (!list) return;
        
        const items = list.querySelectorAll('.country-item');
        const term = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const country = item.getAttribute('data-country').toLowerCase();
            const code = item.getAttribute('data-code');
            if (country.includes(term) || code.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Initialize address handler
    initAddressHandler() {
        this.initAddressCountryDropdown();
        this.bindAddressInputs();
    }

    // Initialize address country dropdown
    initAddressCountryDropdown() {
        const searchInput = document.getElementById('cv-address-country-search');
        const dropdown = document.getElementById('cv-address-country-dropdown');
        const list = document.getElementById('cv-address-country-list');
        const hiddenInput = document.getElementById('cv-address-country');
        const displayInput = document.getElementById('cv-address-country-display');
        
        if (!searchInput || !dropdown || !list || !hiddenInput) return;

        // Populate country list (use same COUNTRY_CODES as phone)
        this.populateAddressCountryList(list);

        let selectedIndex = -1;

        const showDropdown = () => {
            dropdown.style.display = 'block';
            this.filterAddressCountries('');
            selectedIndex = -1;
            searchInput.focus();
        };

        const hideDropdown = () => {
            dropdown.style.display = 'none';
            selectedIndex = -1;
        };

        searchInput.addEventListener('focus', showDropdown);
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdown.style.display === 'none') {
                showDropdown();
            }
        });

        searchInput.addEventListener('input', (e) => {
            this.filterAddressCountries(e.target.value);
            selectedIndex = -1;
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = list.querySelectorAll('.country-item:not([style*="display: none"])');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                this.highlightAddressCountryItem(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                this.highlightAddressCountryItem(items, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (e.key === 'Escape') {
                hideDropdown();
                searchInput.blur();
            }
        });

        document.addEventListener('click', (e) => {
            if (!displayInput.contains(e.target) && !dropdown.contains(e.target)) {
                hideDropdown();
            }
        });

        list.addEventListener('click', (e) => {
            const countryItem = e.target.closest('.country-item');
            if (countryItem) {
                const country = countryItem.getAttribute('data-country');
                hiddenInput.value = country;
                searchInput.value = country;
                hideDropdown();
                this.updateAddressStateDropdown(country);
                this.updateAddressData();
            }
        });
    }

    // Populate address country list
    populateAddressCountryList(list) {
        if (typeof COUNTRY_CODES === 'undefined') {
            console.error('COUNTRY_CODES not loaded');
            return;
        }
        
        list.innerHTML = '';
        COUNTRY_CODES.forEach((country, index) => {
            const item = document.createElement('div');
            item.className = 'country-item';
            item.setAttribute('data-country', country.country);
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', 'false');
            item.setAttribute('tabindex', '-1');
            item.innerHTML = `<span class="country-name">${country.country}</span>`;
            list.appendChild(item);
        });
    }

    // Filter address countries
    filterAddressCountries(searchTerm) {
        const list = document.getElementById('cv-address-country-list');
        if (!list) return;
        
        const items = list.querySelectorAll('.country-item');
        const term = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const country = item.getAttribute('data-country').toLowerCase();
            if (country.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Highlight address country item
    highlightAddressCountryItem(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.setAttribute('aria-selected', 'false');
            }
        });
    }

    // Update state/province dropdown based on country
    updateAddressStateDropdown(countryName) {
        const stateWrapper = document.getElementById('cv-address-state-wrapper');
        const stateSelect = document.getElementById('cv-address-state');
        
        if (!stateWrapper || !stateSelect) return;

        if (this.hasStatesProvinces(countryName)) {
            const states = this.getStatesForCountry(countryName);
            stateSelect.innerHTML = '<option value="">-- Select State/Province --</option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
            stateWrapper.style.display = 'block';
        } else {
            stateWrapper.style.display = 'none';
            stateSelect.value = '';
        }
    }

    // Bind address input events
    bindAddressInputs() {
        const stateSelect = document.getElementById('cv-address-state');
        const cityInput = document.getElementById('cv-address-city');
        const streetInput = document.getElementById('cv-address-street');

        if (stateSelect) {
            stateSelect.addEventListener('change', () => {
                this.updateAddressData();
            });
        }

        if (cityInput) {
            cityInput.addEventListener('input', () => {
                this.updateAddressData();
            });
        }

        if (streetInput) {
            streetInput.addEventListener('input', () => {
                this.updateAddressData();
            });
        }
    }

    // Update address data object
    updateAddressData() {
        const countryInput = document.getElementById('cv-address-country');
        const stateSelect = document.getElementById('cv-address-state');
        const cityInput = document.getElementById('cv-address-city');
        const streetInput = document.getElementById('cv-address-street');

        if (!this.data.address) {
            this.data.address = { country: '', state: '', city: '', street: '' };
        }

        this.data.address.country = countryInput ? countryInput.value : '';
        this.data.address.state = stateSelect ? stateSelect.value : '';
        this.data.address.city = cityInput ? cityInput.value.trim() : '';
        this.data.address.street = streetInput ? streetInput.value.trim() : '';

        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    // Industry-specific skills data
    getIndustrySkills() {
        return {
            it: [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'React', 'Node.js', 'Angular', 'Vue.js',
                'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Docker', 'Kubernetes', 'AWS',
                'Azure', 'Linux', 'Windows Server', 'Networking', 'Cybersecurity', 'UI/UX Design',
                'Agile', 'Scrum', 'DevOps', 'CI/CD', 'REST APIs', 'GraphQL', 'Machine Learning',
                'Data Science', 'Cloud Computing', 'System Administration', 'Database Management'
            ],
            business: [
                'Project Management', 'Strategic Planning', 'Business Analysis', 'Financial Analysis',
                'Market Research', 'Sales', 'Marketing', 'Customer Relations', 'Negotiation',
                'Leadership', 'Team Management', 'Budget Management', 'Risk Management',
                'Data Analysis', 'Excel', 'PowerPoint', 'Business Writing', 'Public Speaking',
                'Stakeholder Management', 'Process Improvement', 'Change Management', 'CRM',
                'ERP Systems', 'Supply Chain Management', 'Operations Management', 'Consulting',
                'Business Development', 'Partnership Development', 'Vendor Management'
            ],
            education: [
                'Curriculum Development', 'Lesson Planning', 'Classroom Management', 'Student Assessment',
                'Educational Technology', 'E-Learning', 'Pedagogy', 'Differentiated Instruction',
                'Special Education', 'Educational Research', 'Academic Writing', 'Research Methods',
                'Student Counseling', 'Parent Communication', 'Educational Leadership', 'Training & Development',
                'Instructional Design', 'Learning Management Systems', 'Educational Psychology',
                'Assessment Design', 'Program Evaluation', 'Grant Writing', 'Educational Policy'
            ],
            engineering: [
                'AutoCAD', 'SolidWorks', 'MATLAB', 'ANSYS', 'Project Management', 'Systems Engineering',
                'Mechanical Design', 'Electrical Engineering', 'Civil Engineering', 'Structural Analysis',
                'CAD/CAM', '3D Modeling', 'Prototyping', 'Quality Control', 'Manufacturing Processes',
                'Materials Science', 'Thermodynamics', 'Fluid Mechanics', 'Control Systems',
                'PLC Programming', 'HVAC Design', 'Building Information Modeling (BIM)', 'Risk Assessment',
                'Technical Writing', 'Engineering Standards', 'Product Development', 'Testing & Validation'
            ],
            health: [
                'Patient Care', 'Medical Records', 'HIPAA Compliance', 'Clinical Documentation',
                'Electronic Health Records (EHR)', 'Medical Terminology', 'Phlebotomy', 'Vital Signs',
                'CPR', 'First Aid', 'Medication Administration', 'Patient Assessment', 'Care Planning',
                'Health Education', 'Public Health', 'Epidemiology', 'Health Informatics',
                'Medical Billing', 'Medical Coding', 'Healthcare Administration', 'Telemedicine',
                'Medical Research', 'Clinical Trials', 'Health Policy', 'Healthcare Quality'
            ],
            hospitality: [
                'Customer Service', 'Guest Relations', 'Event Planning', 'Hotel Management',
                'Restaurant Management', 'Food & Beverage', 'Front Office Operations', 'Housekeeping',
                'Revenue Management', 'Reservation Systems', 'Tourism', 'Travel Planning',
                'Catering', 'Banquet Management', 'Hospitality Marketing', 'Quality Assurance',
                'Staff Training', 'Inventory Management', 'Point of Sale (POS)', 'Hospitality Software',
                'Concierge Services', 'Spa Management', 'Entertainment Management', 'Hospitality Sales'
            ]
        };
    }

    // States/Provinces data for major countries
    getStatesProvinces() {
        return {
            'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
            'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
            'Australia': ['Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'],
            'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
            'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
            'Brazil': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
            'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
            'China': ['Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Macau', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'],
            'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'],
            'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
            'Kenya': ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'],
            'Zambia': ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western']
        };
    }

    // Check if country has states/provinces
    hasStatesProvinces(countryName) {
        const states = this.getStatesProvinces();
        return states.hasOwnProperty(countryName);
    }

    // Get states/provinces for a country
    getStatesForCountry(countryName) {
        const states = this.getStatesProvinces();
        return states[countryName] || [];
    }

    getDefaultData() {
        return {
            name: '',
            email: '',
            phone: '',
            address: {
                country: '',
                state: '',
                city: '',
                street: ''
            },
            summary: '',
            education: [{ year: '', level: '', school: '', qualification: '' }],
            work: [{ title: '', company: '', period: '', description: '' }],
            research: [{ title: '', institution: '', period: '', description: '' }],
            publications: [{ title: '', venue: '', year: '' }],
            certifications: [{ name: '', issuer: '', year: '' }],
            conferences: [{ name: '', location: '', year: '' }],
            achievements: [{ description: '' }],
            projects: [{ name: '', tech: '', description: '' }],
            skills: [],
            references: [{ name: '', position: '', phone: '', email: '' }]
        };
    }

    init() {
        // Bind input events
        this.bindInputs();
        // Bind add buttons
        this.bindAddButtons();
        // Initialize skills selector
        this.initSkillsSelector();
        // Initialize manual skills input
        this.initManualSkillsInput();
        // Initialize phone handler
        this.initPhoneHandler();
        // Initialize address handler
        this.initAddressHandler();
        // Load fake data initially
        this.loadFakeData();
        // Ensure at least one education row exists after loading data
        this.ensureEducationRow();
    }

    initSkillsSelector() {
        const industrySelect = document.getElementById('cv-industry-select');
        if (!industrySelect) return;

        industrySelect.addEventListener('change', (e) => {
            this.selectedIndustry = e.target.value;
            this.loadSkillsForIndustry(this.selectedIndustry);
        });
    }

    loadSkillsForIndustry(industry) {
        const skillsContainer = document.getElementById('cv-skills-container');
        const checkboxesContainer = document.getElementById('cv-skills-checkboxes');
        
        if (!skillsContainer || !checkboxesContainer) return;

        if (!industry) {
            skillsContainer.style.display = 'none';
            return;
        }

        const industrySkills = this.getIndustrySkills()[industry] || [];
        checkboxesContainer.innerHTML = '';

        industrySkills.forEach((skill, index) => {
            const label = document.createElement('label');
            label.className = 'skill-checkbox-label';
            
            // Generate unique ID for checkbox
            const checkboxId = `cv-skill-${index}-${skill.toLowerCase().replace(/\s+/g, '-')}`;
            
            // Set for attribute on label to associate with checkbox
            label.setAttribute('for', checkboxId);
            
            const checkbox = document.createElement('input');
            checkbox.id = checkboxId;
            checkbox.name = `skills[]`;
            checkbox.type = 'checkbox';
            checkbox.value = skill;
            checkbox.className = 'skill-checkbox';
            
            // Check if this skill is already selected
            if (this.selectedSkills.includes(skill)) {
                checkbox.checked = true;
            }
            
            checkbox.addEventListener('change', (e) => {
                this.handleSkillToggle(skill, e.target.checked);
            });
            
            const span = document.createElement('span');
            span.textContent = skill;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            checkboxesContainer.appendChild(label);
        });

        skillsContainer.style.display = 'block';
    }

    handleSkillToggle(skill, isChecked) {
        if (isChecked) {
            if (!this.selectedSkills.includes(skill)) {
                this.selectedSkills.push(skill);
            }
        } else {
            this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
        }
        
        this.updateSkillsData();
    }

    // Update skills data from both checkboxes and manual input
    updateSkillsData() {
        const manualInput = document.getElementById('cv-skills-manual');
        let allSkills = [...this.selectedSkills];
        
        // Add manually entered skills
        if (manualInput && manualInput.value.trim()) {
            const manualSkills = manualInput.value
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            // Merge with checkbox skills, avoiding duplicates
            manualSkills.forEach(skill => {
                if (!allSkills.includes(skill)) {
                    allSkills.push(skill);
                }
            });
        }
        
        this.data.skills = allSkills;
        
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    // Initialize manual skills input
    initManualSkillsInput() {
        const manualInput = document.getElementById('cv-skills-manual');
        if (!manualInput) return;

        manualInput.addEventListener('input', () => {
            this.updateSkillsData();
        });
    }

    ensureEducationRow() {
        const container = document.getElementById('cv-education-container');
        if (container && container.children.length === 0) {
            this.addEducationRow();
        }
    }

    loadFakeData() {
        // Set fake placeholder data
        const fakeData = {
            name: 'John Banda',
            email: 'john.banda@email.com',
            phone: '+123 456 7890',
            address: {
                country: 'Zambia',
                state: 'Lusaka',
                city: 'Lusaka',
                street: '123 Main Street'
            },
            summary: 'Motivated IT specialist with 4+ years of experience in software development and system administration. Proven track record of delivering high-quality solutions and leading cross-functional teams.',
            education: [
                { year: '2015-2017', level: 'Tertiary', school: 'Rockview University', qualification: 'Diploma in Computer Science' },
                { year: '2010-2014', level: 'Grade 12', school: 'Central High School', qualification: 'Certificate' }
            ],
            work: [
                { title: 'Junior Developer', company: 'TechLabs Inc.', period: '2021-2023', description: 'Developed and maintained web applications using Python and React. Collaborated with senior developers on system architecture improvements.' },
                { title: 'Software Intern', company: 'StartupCorp', period: '2020-2021', description: 'Assisted in developing REST APIs and database management systems. Participated in code reviews and agile ceremonies.' }
            ],
            research: [
                { title: 'Deep Learning Applications', institution: 'Research Institute', period: '2019-2020', description: 'Research on applying deep learning techniques to medical image analysis.' }
            ],
            publications: [
                { title: 'Optimizing Neural Networks for Real-Time Processing', venue: 'IEEE Conference 2020', year: '2020' }
            ],
            certifications: [
                { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: '2022' },
                { name: 'Certified Python Developer', issuer: 'Python Institute', year: '2021' }
            ],
            conferences: [
                { name: 'Tech Conference 2023', location: 'San Francisco, USA', year: '2023' },
                { name: 'AI Workshop 2022', location: 'Online', year: '2022' }
            ],
            achievements: [
                { description: 'Winner of National Coding Competition 2022' },
                { description: 'Published 3 research papers in peer-reviewed journals' }
            ],
            projects: [
                { name: 'E-Commerce Platform', tech: 'Python, Django, React, PostgreSQL', description: 'Full-stack e-commerce solution with payment integration and inventory management.' },
                { name: 'Machine Learning API', tech: 'Python, Flask, TensorFlow', description: 'RESTful API for image classification using deep learning models.' }
            ],
            skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Networking', 'UI Design', 'Database Management', 'Git', 'Docker', 'AWS'],
            references: [
                { name: 'Dr. Sarah Johnson', position: 'Senior Software Engineer', phone: '+1 234 567 8900', email: 'sarah.johnson@email.com' },
                { name: 'Prof. Michael Chen', position: 'Professor of Computer Science', phone: '+1 234 567 8901', email: 'michael.chen@university.edu' }
            ]
        };

        // Populate form with fake data
        Object.keys(fakeData).forEach(key => {
            if (key === 'name') document.getElementById('cv-name').value = fakeData[key];
            else if (key === 'email') document.getElementById('cv-email').value = fakeData[key];
            else if (key === 'phone') {
                // Parse fake phone data (e.g., "+123 456 7890" -> country code +1, number "234567890")
                const phoneValue = fakeData[key];
                if (phoneValue && phoneValue.startsWith('+')) {
                    const match = phoneValue.match(/^(\+\d+)\s*(.+)$/);
                    if (match) {
                        const countryCode = match[1];
                        const phoneNumber = match[2].replace(/\s/g, '');
                        const hiddenCountryInput = document.getElementById('cv-country-code');
                        const searchInput = document.getElementById('cv-country-code-search');
                        const phoneInput = document.getElementById('cv-phone-number');
                        
                        // Find country name from code
                        if (typeof COUNTRY_CODES !== 'undefined') {
                            const country = COUNTRY_CODES.find(c => c.code === countryCode);
                            if (country && searchInput) {
                                searchInput.value = `${country.country} (${countryCode})`;
                            }
                        }
                        
                        if (hiddenCountryInput) {
                            hiddenCountryInput.value = countryCode;
                        }
                        if (phoneInput) {
                            phoneInput.value = phoneNumber;
                        }
                        // Update display
                        setTimeout(() => this.updatePhoneDisplay(), 100);
                    }
                }
            }
            else if (key === 'address') {
                // Handle structured address
                if (typeof fakeData[key] === 'object' && fakeData[key] !== null) {
                    const addr = fakeData[key];
                    const countryInput = document.getElementById('cv-address-country');
                    const countrySearch = document.getElementById('cv-address-country-search');
                    const stateSelect = document.getElementById('cv-address-state');
                    const cityInput = document.getElementById('cv-address-city');
                    const streetInput = document.getElementById('cv-address-street');
                    
                    if (addr.country && countryInput && countrySearch) {
                        countryInput.value = addr.country;
                        countrySearch.value = addr.country;
                        this.updateAddressStateDropdown(addr.country);
                    }
                    if (addr.state && stateSelect) {
                        stateSelect.value = addr.state;
                    }
                    if (addr.city && cityInput) {
                        cityInput.value = addr.city;
                    }
                    if (addr.street && streetInput) {
                        streetInput.value = addr.street;
                    }
                    this.updateAddressData();
                } else if (typeof fakeData[key] === 'string') {
                    // Legacy: handle old string format
                    const cityInput = document.getElementById('cv-address-city');
                    if (cityInput) {
                        cityInput.value = fakeData[key];
                        this.updateAddressData();
                    }
                }
            }
            else if (key === 'summary') document.getElementById('cv-summary').value = fakeData[key];
            else if (key === 'skills') {
                // Handle skills array - set IT industry and select skills
                this.selectedSkills = [...fakeData[key]];
                const industrySelect = document.getElementById('cv-industry-select');
                if (industrySelect) {
                    industrySelect.value = 'it';
                    this.selectedIndustry = 'it';
                    this.loadSkillsForIndustry('it');
                }
                // Update skills data (will merge checkbox and manual skills)
                this.updateSkillsData();
            }
            else if (Array.isArray(fakeData[key])) {
                this.populateArrayField(key, fakeData[key]);
            }
        });

        // Update data object
        this.data = fakeData;
    }

    populateArrayField(fieldName, items) {
        const container = document.getElementById(`cv-${fieldName}-container`);
        if (!container) return;

        container.innerHTML = '';
        if (fieldName === 'education') {
            items.forEach(item => {
                this.addEducationRow(item);
            });
        } else {
            items.forEach(item => {
                this.addEntryItem(fieldName, item);
            });
        }
    }

    bindInputs() {
        // Single field inputs (phone, address, and skills are now handled separately)
        const singleFields = ['name', 'email', 'summary'];
        singleFields.forEach(field => {
            const element = document.getElementById(`cv-${field}`);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.data[field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                });
            }
        });
        
        // Phone is handled by initPhoneHandler() - the hidden field is updated there
        // Address is handled by initAddressHandler() - structured address data

        // Array field inputs - use event delegation
        const cvSection = document.getElementById('cv-section');
        if (!cvSection) return; // Section doesn't exist (e.g., on resume builder page)
        
        // Store reference for bindAddButtons
        this.cvSection = cvSection;
        
        cvSection.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            if (!field) return;

            // Check if it's an education table input
            const tableRow = e.target.closest('tr');
            if (tableRow && e.target.closest('#cv-education-container')) {
                const container = document.getElementById('cv-education-container');
                const index = Array.from(container.children).indexOf(tableRow);
                if (this.data.education && this.data.education[index]) {
                    this.data.education[index][field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                }
                return;
            }

            // Handle regular entry-items
            const entryItem = e.target.closest('.entry-item');
            if (!entryItem) return;

            const container = entryItem.parentElement;
            const index = Array.from(container.children).indexOf(entryItem);
            const fieldType = container.id.replace('cv-', '').replace('-container', '');

            if (this.data[fieldType] && this.data[fieldType][index]) {
                this.data[fieldType][index][field] = e.target.value;
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
            }
        });
    }

    bindAddButtons() {
        if (!this.cvSection) return; // Section doesn't exist
        this.cvSection.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                const fieldType = e.target.getAttribute('data-add');
                this.addEntryItem(fieldType);
            } else if (e.target.classList.contains('remove-btn')) {
                const entryItem = e.target.closest('.entry-item');
                if (entryItem) {
                    this.handleRemoveEntry(entryItem);
                }
            }
        });
    }

    addEntryItem(fieldType, data = null) {
        const container = document.getElementById(`cv-${fieldType}-container`);
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        // Generate unique index for this entry
        const entryIndex = container.children.length;
        const timestamp = Date.now();
        const uniqueId = `${fieldType}-${entryIndex}-${timestamp}`;

        let fields = [];
        if (fieldType === 'education') {
            // Education is now handled as a table, not entry-item
            return this.addEducationRow(data);
        } else if (fieldType === 'work') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Job Title' },
                { field: 'company', type: 'text', placeholder: 'Company' },
                { field: 'period', type: 'text', placeholder: 'Period (e.g., 2020-2023)' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'research') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Research Title' },
                { field: 'institution', type: 'text', placeholder: 'Institution' },
                { field: 'period', type: 'text', placeholder: 'Period' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'publications') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Publication Title' },
                { field: 'venue', type: 'text', placeholder: 'Journal/Conference' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'certifications') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Certification Name' },
                { field: 'issuer', type: 'text', placeholder: 'Issuing Organization' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'conferences') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Event Name' },
                { field: 'location', type: 'text', placeholder: 'Location' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'achievements') {
            fields = [
                { field: 'description', type: 'textarea', placeholder: 'Achievement description', rows: 2 }
            ];
        } else if (fieldType === 'projects') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Project Name' },
                { field: 'tech', type: 'text', placeholder: 'Technologies Used' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'references') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Name' },
                { field: 'position', type: 'text', placeholder: 'Position' },
                { field: 'phone', type: 'tel', placeholder: 'Phone Number' },
                { field: 'email', type: 'email', placeholder: 'Email (Optional)' }
            ];
        }

        fields.forEach(f => {
            const fieldId = `cv-${uniqueId}-${f.field}`;
            const fieldName = `${fieldType}[${entryIndex}][${f.field}]`;
            
            if (f.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.id = fieldId;
                textarea.name = fieldName;
                textarea.className = 'entry-field';
                textarea.setAttribute('data-field', f.field);
                textarea.placeholder = f.placeholder;
                textarea.rows = f.rows || 2;
                if (data && data[f.field]) textarea.value = data[f.field];
                entryDiv.appendChild(textarea);
            } else {
                const input = document.createElement('input');
                input.id = fieldId;
                input.name = fieldName;
                input.type = f.type || 'text';
                input.className = 'entry-field';
                input.setAttribute('data-field', f.field);
                input.placeholder = f.placeholder;
                if (data && data[f.field]) input.value = data[f.field];
                entryDiv.appendChild(input);
            }
        });

        if (container.children.length > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            entryDiv.appendChild(removeBtn);
        }

        container.appendChild(entryDiv);

        // Update data object
        if (!this.data[fieldType]) {
            this.data[fieldType] = [];
        }
        const newItem = {};
        fields.forEach(f => {
            newItem[f.field] = data ? (data[f.field] || '') : '';
        });
        this.data[fieldType].push(newItem);
    }

    addEducationRow(data = null) {
        const container = document.getElementById('cv-education-container');
        if (!container) return;

        const row = document.createElement('tr');
        
        // Generate unique index for this row
        const rowIndex = container.children.length;
        const timestamp = Date.now();
        const uniqueId = `education-${rowIndex}-${timestamp}`;
        
        // Year field
        const yearCell = document.createElement('td');
        const yearInput = document.createElement('input');
        yearInput.id = `cv-${uniqueId}-year`;
        yearInput.name = `education[${rowIndex}][year]`;
        yearInput.type = 'text';
        yearInput.setAttribute('data-field', 'year');
        yearInput.placeholder = 'e.g., 2015-2017';
        if (data && data.year) yearInput.value = data.year;
        yearCell.appendChild(yearInput);
        row.appendChild(yearCell);

        // Level field
        const levelCell = document.createElement('td');
        const levelInput = document.createElement('input');
        levelInput.id = `cv-${uniqueId}-level`;
        levelInput.name = `education[${rowIndex}][level]`;
        levelInput.type = 'text';
        levelInput.setAttribute('data-field', 'level');
        levelInput.placeholder = 'e.g., Grade 12, Tertiary, Bachelor';
        if (data && data.level) levelInput.value = data.level;
        levelCell.appendChild(levelInput);
        row.appendChild(levelCell);

        // School field
        const schoolCell = document.createElement('td');
        const schoolInput = document.createElement('input');
        schoolInput.id = `cv-${uniqueId}-school`;
        schoolInput.name = `education[${rowIndex}][school]`;
        schoolInput.type = 'text';
        schoolInput.setAttribute('data-field', 'school');
        schoolInput.placeholder = 'e.g., Rockview University';
        if (data && data.school) schoolInput.value = data.school;
        schoolCell.appendChild(schoolInput);
        row.appendChild(schoolCell);

        // Qualification field
        const qualificationCell = document.createElement('td');
        const qualificationInput = document.createElement('input');
        qualificationInput.id = `cv-${uniqueId}-qualification`;
        qualificationInput.name = `education[${rowIndex}][qualification]`;
        qualificationInput.type = 'text';
        qualificationInput.setAttribute('data-field', 'qualification');
        qualificationInput.placeholder = 'e.g., Certificate, Diploma';
        if (data && data.qualification) qualificationInput.value = data.qualification;
        qualificationCell.appendChild(qualificationInput);
        row.appendChild(qualificationCell);

        // Remove button cell
        const actionCell = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'table-remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', async () => {
            const index = Array.from(container.children).indexOf(row);
            if (this.data.education && this.data.education.length > 1) {
                const confirmed = await window.uxEnhancements?.showConfirmationDialog(
                    'Are you sure you want to remove this education entry?',
                    'Remove Entry'
                );
                if (!confirmed) return;

                this.data.education.splice(index, 1);
                row.remove();
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
                // Save state for undo
                if (window.uxEnhancements) {
                    setTimeout(() => window.uxEnhancements.saveState(), 100);
                }
            } else if (this.data.education && this.data.education.length === 1) {
                // Keep at least one row, just clear it
                this.data.education[0] = { year: '', level: '', school: '', qualification: '' };
                yearInput.value = '';
                levelInput.value = '';
                schoolInput.value = '';
                qualificationInput.value = '';
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
            }
        });
        actionCell.appendChild(removeBtn);
        row.appendChild(actionCell);

        container.appendChild(row);

        // Update data object
        if (!this.data.education) {
            this.data.education = [];
        }
        const newItem = {
            year: data ? (data.year || '') : '',
            level: data ? (data.level || '') : '',
            school: data ? (data.school || '') : '',
            qualification: data ? (data.qualification || '') : ''
        };
        this.data.education.push(newItem);

        // Bind input events for this row
        [yearInput, levelInput, schoolInput, qualificationInput].forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.getAttribute('data-field');
                const rowIndex = Array.from(container.children).indexOf(row);
                if (this.data.education && this.data.education[rowIndex]) {
                    this.data.education[rowIndex][field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                }
            });
        });
    }

    async handleRemoveEntry(entryItem) {
        const confirmed = await window.uxEnhancements?.showConfirmationDialog(
            'Are you sure you want to remove this entry?',
            'Remove Entry'
        );
        if (!confirmed) return;

        const container = entryItem.parentElement;
        const index = Array.from(container.children).indexOf(entryItem);
        const fieldType = container.id.replace('cv-', '').replace('-container', '');
        
        if (this.data[fieldType] && this.data[fieldType].length > 1) {
            this.data[fieldType].splice(index, 1);
            entryItem.remove();
            if (window.previewManager) {
                window.previewManager.updatePreview();
            }
            // Save state for undo
            if (window.uxEnhancements) {
                setTimeout(() => window.uxEnhancements.saveState(), 100);
            }
        }
    }

    getData() {
        return this.data;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cvFormManager = new CVFormManager();
    });
} else {
    window.cvFormManager = new CVFormManager();
}


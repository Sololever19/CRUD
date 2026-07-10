/**
 * MODULE 3: Validation Module
 * Ensures accurate and valid customer data before DB operations.
 */
const Validator = (() => {

  function validateName(name) {
    if (!name || !name.trim()) return 'Customer name is required.';
    if (!/^[a-zA-Z\s''-]{2,60}$/.test(name.trim()))
      return 'Name must be 2–60 characters (letters and spaces only).';
    return null;
  }

  function validatePhone(phone) {
    if (!phone || !phone.trim()) return 'Phone number is required.';
    if (!/^\d{10}$/.test(phone.trim()))
      return 'Phone number must be exactly 10 digits.';
    return null;
  }

  function validateEmail(email) {
    if (!email || !email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Please enter a valid email address.';
    return null;
  }

  function validateAddress(address) {
    if (!address || !address.trim()) return 'Address is required.';
    if (address.trim().length < 5) return 'Address must be at least 5 characters.';
    return null;
  }

  function validateCity(city) {
    if (!city || !city.trim()) return 'City is required.';
    if (!/^[a-zA-Z\s]{2,40}$/.test(city.trim()))
      return 'City must be 2–40 letters only.';
    return null;
  }

  /**
   * Validate a full customer object.
   * @param {Object} data - Customer fields
   * @param {string|null} excludeId - Customer ID to exclude from duplicate checks (for edits)
   * @returns {{ valid: boolean, errors: Object }}
   */
  function validateCustomer(data, excludeId = null) {
    const errors = {};

    const nameErr    = validateName(data.name);
    const phoneErr   = validatePhone(data.phone);
    const emailErr   = validateEmail(data.email);
    const addrErr    = validateAddress(data.address);
    const cityErr    = validateCity(data.city);

    if (nameErr)  errors.name    = nameErr;
    if (phoneErr) errors.phone   = phoneErr;
    if (emailErr) errors.email   = emailErr;
    if (addrErr)  errors.address = addrErr;
    if (cityErr)  errors.city    = cityErr;

    // Duplicate checks
    if (!phoneErr || !emailErr) {
      const existing = DB.getAll().filter(c => c.id !== excludeId);
      if (!phoneErr && existing.some(c => c.phone === data.phone.trim())) {
        errors.phone = 'This phone number is already registered.';
      }
      if (!emailErr && existing.some(c => c.email.toLowerCase() === data.email.trim().toLowerCase())) {
        errors.email = 'This email address is already registered.';
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  return { validateCustomer, validateName, validatePhone, validateEmail };
})();

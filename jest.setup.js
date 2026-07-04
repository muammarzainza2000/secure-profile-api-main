require('dotenv').config();

// Set environment variables untuk testing
process.env.JWT_SECRET = 'test_secret_key_yang_cukup_panjang_untuk_testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
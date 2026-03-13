const { body, validationResult } = require('express-validator')

const handleValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

const registrationRules = [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('transaction_id').trim().notEmpty().withMessage('Payment transaction ID or MoMo number is required'),
    body('profession').notEmpty().withMessage('Profession is required'),
    body('ai_experience').notEmpty().withMessage('AI experience level is required'),
    body('learning_goals').optional().trim(),
    body('referral_source').optional().trim(),
]

const contactRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
]

const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
]

module.exports = { handleValidation, registrationRules, contactRules, loginRules }

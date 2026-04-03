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
    body('transaction_id').optional({ checkFalsy: true }).trim(),
    body('profession').optional({ checkFalsy: true }),
    body('ai_experience').optional({ checkFalsy: true }),
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

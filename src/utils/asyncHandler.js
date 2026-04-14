// method 1 using try catch

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// };

// method 2 using Promise.resolve

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            if (typeof next === "function") {
                return next(error);
            }

            return res.status(error?.statusCode || 500).json({
                success: false,
                message: error?.message || "Internal Server Error",
                errors: error?.errors || [],
            });
        });
    };
};

export default asyncHandler;
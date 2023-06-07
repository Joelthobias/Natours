const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (! doc) {
        return next(new AppError('No doc found with the given ID', 404))
    };
    res.status(204).json({'status': 'Success', 'data': null});
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (! doc) {
        return next(new AppError('No doc found with the given ID', 404))
    };
    res.status(200).json({
        'status': 'Sucess',
        'data': {
            data: doc
        }
    });
});
exports.CreateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({'status': 'Sucess', 'data': {
            doc
        }})
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let Qurey = Model.findById(req.params.id);
    if (populateOptions) Qurey = Qurey.populate(populateOptions);
    

    const doc = await Qurey;
    if (populateOptions) console.log(doc.reviews);

    if (! doc) {
        return next(new AppError('No documnet found with the given ID', 404))
    };

    res.status(200).json({'status': 'Sucess', 'data': {
            doc
        }})
});
exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    let filter = {}
    if (req.params.tourId) 
        filter = {
            tour: req.params.tourId
        };
    

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    const doc = await features.query;

    // Send Response
    res.status(200).json({
        'status': 'Sucess',
        'results': doc.length, 
        'data': {
            doc
        }
    })
    // res.status(200).render('body',{
    //     doc
    // })
});

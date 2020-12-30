const mongoose = require('mongoose');


const pageSchema = mongoose.Schema({
    uid:{
        type: String,
    },
    assignments: {
        type: Object,
        default: {}
    },
    date: {
        type: Date,
        default: new Date().toISOString()
    }
},{
    collection: 'crawl'
})

module.exports = mongoose.model('Page', pageSchema);



/**
 * UploadController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
index : function(req,res){
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
    '<form action="/upload/uploadAvatar" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="avatar" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
    );
},
/**
 * Upload avatar for currently logged-in user
 *
 * (POST /upload/)
 */
uploadAvatar: function (req, res) {
  req.file('avatar').upload({
    // don't allow the total upload size to exceed ~10MB
    maxBytes: 10000000000000
  },function whenDone(err, uploadedFiles) {
    if (err) {
      return res.negotiate(err);
    }

    // If no files were uploaded, respond with an error.
    if (uploadedFiles.length === 0){
      return res.badRequest('No file was uploaded');
    }


    // Save the "fd" and the url where the avatar for a user can be accessed
    Upload.create({

      // Generate a unique URL where the avatar can be downloaded.
      //avatarUrl: require('util').format('%s/avatar/%s', sails.getBaseUrl(), req.session.me),

      // Grab the first file and use it's `fd` (file descriptor)
      avatarFd: uploadedFiles[0].fd
    })
    .exec(function (err){
      if (err) return res.negotiate(err);
      return res.ok();
    });
  });
},

upload : function(req,res){
    req.file('avatar').upload({
      dirname: require('path').resolve(sails.config.appPath, '/images')
    },function (err, uploadedFiles) {
      if (err) return res.negotiate(err);

      return res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!'
      });
    });
},
/**
 * Download avatar of the user with the specified id
 *
 * (GET /upload/avatar/:id)
 */
avatar: function (req, res){

  req.validate({
    id: 'string'
  });

  Upload.findOne(req.param('id')).exec(function (err, user){
    if (err) return res.negotiate(err);
    if (!user) return res.notFound();

    // User has no avatar image uploaded.
    // (should have never have hit this endpoint and used the default image)
    if (!user.avatarFd) {
      return res.notFound();
    }

    var SkipperDisk = require('skipper-disk');
    var fileAdapter = SkipperDisk(/* optional opts */);

    // Stream the file down
    fileAdapter.read(user.avatarFd)
    .on('error', function (err){
      return res.serverError(err);
    })
    .pipe(res);
  });
},

adv: function (req, res){

  Upload.find().exec(function (err, advert){
    if (err) return res.negotiate(err);
    if (!advert) return res.notFound();

    var adv = advert[Math.floor(Math.random() * advert.length)];

    var SkipperDisk = require('skipper-disk');
    var fileAdapter = SkipperDisk(/* optional opts */);

    // Stream the file down
    fileAdapter.read(adv.avatarFd)
    .on('error', function (err){
      return res.serverError(err);
    })
    .pipe(res);
  });
}


};


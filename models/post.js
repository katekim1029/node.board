module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });

    Post.associate = (db) => {
        db.Post.belongsTo(db.User); // UserId
        // db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.Image);
        // db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    };

    return Post;
};

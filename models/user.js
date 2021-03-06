module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING(50), // 50 이내
            allowNull: false, // 필수
            unique: true, // 중복금지
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글 저장
    });

    User.associate = (db) => {
        db.User.hasMany(db.Post);
        // db.User.hasMany(db.Comment);
    };

    return User;
};

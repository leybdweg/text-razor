'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const query = `CREATE TABLE entities
                   (
                     id        INT(10) AUTO_INCREMENT NOT NULL,
                     razorId   varchar(100)           NOT NULL,
                     razorData TEXT                   NULL,
                     fileId    varchar(50)            NOT NULL,
                     createdAt TIMESTAMP              NULL,
                     PRIMARY KEY (\`id\`)
                   )
      ENGINE = InnoDB
      DEFAULT CHARSET = latin1
      COLLATE = latin1_swedish_ci;
    `;

    return queryInterface.sequelize.query(query)

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP TABLE entities;');
  }
};

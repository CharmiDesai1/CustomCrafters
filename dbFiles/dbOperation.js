const config = require('./dbConfig');
const dbConfig = require("./dbConfig");
const bcrypt = require("bcrypt");
const sql = require("mssql");
const saltRounds = 10;

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

const getDevelopers = async () => {
    try {
        await poolConnect;
        let developers = await pool.request().query("SELECT * FROM Developer");
        return developers.recordset;
    } catch (error) {
        console.error("Get Developers Error:", error);
        throw error;
    }
};

const validatePassword = (password) => {
  const minLength = 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const lengthValid = password.length >= minLength;

  const errors = [];

  if (!lengthValid) errors.push(`Password must be at least ${minLength} characters long (currently ${password.length}).`);
  if (!hasLowercase) errors.push('Password must include at least one lowercase letter.');
  if (!hasUppercase) errors.push('Password must include at least one uppercase letter.');
  if (!hasDigit) errors.push('Password must include at least one number.');
  if (!hasSpecialChar) errors.push('Password must include at least one special character.');

  if (errors.length > 0) {
      throw new Error(errors.join(' '));
  }
};

const insertDeveloper = async (fullName, email, password) => {
    try {
        validatePassword(password);
        await poolConnect;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let result = await pool.request()
            .input('full_name', sql.VarChar(100), fullName)
            .input('email', sql.VarChar(100), email)
            .input('password_hash', sql.NVarChar(sql.MAX), hashedPassword)
            .query(`INSERT INTO Developer (full_name, email, password_hash) VALUES (@full_name, @email, @password_hash)`);
        return result;
    } catch (error) {
        console.error('Insert Developer Error:', error);
        throw error;
    }
};

const googleLogin = async (displayName, email) => {
    try {
        await poolConnect;
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        await pool.request()
            .input('full_name', sql.VarChar(100), displayName)
            .input('email', sql.VarChar(100), email)
            .input('password_hash', sql.NVarChar(sql.MAX), hashedPassword)
            .query(`
                IF NOT EXISTS (SELECT * FROM Developer WHERE email = @email)
                BEGIN
                    INSERT INTO Developer (full_name, email, password_hash)
                    VALUES (@full_name, @email, @password_hash)
                END
            `);

        return { message: "Google user registered successfully" };
    } catch (error) {
        console.error('Google Login Error:', error);
        throw error;
    }
};

const loginDeveloper = async (email, password) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .input('email', sql.VarChar(100), email)
            .query('SELECT * FROM Developer WHERE email = @email');

        if (result.recordset.length === 0) {
            return { success: false, message: "Invalid user" };
        }

        const developer = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, developer.password_hash);

        if (!isPasswordValid) {
            return { success: false, message: "Invalid password" };
        }

        return { success: true, developer };
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

const getUsers = async () => {
    try {
        await poolConnect;
        let users = await pool.request().query("SELECT * FROM Users");
        return users.recordset;
    } catch (error) {
        console.error("Get Users Error:", error);
        throw error;
    }
};

const insertUser = async (fullName, email, password) => {
  try {
      validatePassword(password);
      await poolConnect;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      let result = await pool.request()
          .input('full_name', sql.VarChar(100), fullName)
          .input('email', sql.VarChar(100), email)
          .input('password_hash', sql.NVarChar(sql.MAX), hashedPassword)
          .query(`INSERT INTO Users (full_name, email, password_hash) VALUES (@full_name, @email, @password_hash)`);
      return result;

  } catch (error) {
      console.error('Insert User Error:', error);
      throw error;
  }
};

const googleLoginUser = async (displayName, email) => {
    try {
        await poolConnect;
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        await pool.request()
            .input('full_name', sql.VarChar(100), displayName)
            .input('email', sql.VarChar(100), email)
            .input('password_hash', sql.NVarChar(sql.MAX), hashedPassword)
            .query(`
                IF NOT EXISTS (SELECT * FROM Users WHERE email = @email)
                BEGIN
                    INSERT INTO Users (full_name, email, password_hash)
                    VALUES (@full_name, @email, @password_hash)
                END
            `);

        return { message: "Google user registered successfully" };
    } catch (error) {
        console.error('Google Login Error:', error);
        throw error;
    }
};

const loginUser = async (email, password) => {
    console.log("loginUser function called with:", email);

    try {
        await poolConnect;
        const result = await pool
            .request()
            .input("email", sql.VarChar(100), email)
            .query("SELECT * FROM Users WHERE email = @email");

        if (!result.recordset.length) {
            console.log("No user found for:", email);
            return { success: false, message: "Invalid email or password" };
        }

        const user = result.recordset[0];

        if (!user.user_id) {
            console.error("user_id is missing in database!");
            return { success: false, message: "User ID missing in database record" };
        }

        return { success: true, user };

    } catch (error) {
        console.error("Database error:", error);
        return { success: false, message: "Database error", error };
    }
};

const getProjects = async () => {
  try {
      await poolConnect;
      let result = await pool.request().query(`
          SELECT 
              property_id, 
              project_name, 
              apartment_type, 
              carpet_area, 
              development_stage, 
              image_url, 
              developer_id 
          FROM Properties
      `);
      return result.recordset;
  } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
  }
};

async function fetchProjects() {
  const pool = await sql.connect(dbConfig);
  const result = await pool
    .request()
    .query(`
      SELECT DISTINCT
        p.property_id AS id,
        p.project_name,
        p.apartment_type,
        p.carpet_area,
        p.development_stage,
        p.image_url,
        a.annotated_file_name
      FROM Properties p
      LEFT JOIN Annotations a ON p.property_id = a.property_id
    `);
  return result.recordset;
}
  
  async function getPdfById(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid PDF ID.");
    }
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT property_id as id, floor_plan_file_name, floor_plan_file_data FROM Properties WHERE property_id = @id");
  
    if (result.recordset.length === 0) {
      throw new Error("PDF not found.");
    }
    return result.recordset[0];
  }

  async function getBrochureById(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid PDF ID.");
    }
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT property_id as id, brochure_file_name, brochure_file_data FROM Properties WHERE property_id = @id");
  
    if (result.recordset.length === 0) {
      throw new Error("PDF not found.");
    }
    return result.recordset[0];
  }

async function getUserProperties(userId) {
  if (!userId || isNaN(userId)) {
    throw new Error("Invalid User ID.");
  }

  const pool = await sql.connect(dbConfig);
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT 
        p.property_id, p.project_name, p.apartment_type, p.carpet_area, 
        p.development_stage, p.image_url, 
        p.brochure_file_name, p.floor_plan_file_name
      FROM Properties p
      INNER JOIN UserProperties up ON p.property_id = up.property_id
      WHERE up.user_id = @userId
    `);
  return result.recordset;
}

async function getPropertyFile(userId, propertyId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("propertyId", sql.Int, propertyId)
    .query(`
      SELECT brochure_file_name, brochure_file_data, 
             floor_plan_file_name, floor_plan_file_data
      FROM Properties 
      WHERE property_id = @propertyId
    `);
  if (result.recordset.length === 0) {
    throw new Error("File not found.");
  }
  return result.recordset[0];
}

const voteOnSuggestion = async (userId, suggestionId, voteType) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("suggestionId", sql.Int, suggestionId)
      .query("SELECT likes, dislikes, voted_users FROM PropertySuggestions WHERE id = @suggestionId");

    if (result.recordset.length === 0) {
      return { success: false, message: "Suggestion not found." };
    }

    let { likes, dislikes, voted_users } = result.recordset[0];

    try {
      voted_users = JSON.parse(voted_users || "[]");
    } catch (e) {
      console.error("Error parsing voted_users JSON:", e);
      voted_users = [];
    }

    const existingVoteIndex = voted_users.findIndex((vote) => vote.userId === userId);
    const existingVote = existingVoteIndex !== -1 ? voted_users[existingVoteIndex] : null;

    if (existingVote) {
      if (existingVote.vote === voteType) {
        return { success: false, message: "User has already voted this way." };
      }
      if (existingVote.vote === "up" && voteType === "down") {
        likes -= 1;
        dislikes += 1;
      } else if (existingVote.vote === "down" && voteType === "up") {
        dislikes -= 1;
        likes += 1;
      }
      voted_users[existingVoteIndex].vote = voteType;
    } else {
      if (voteType === "up") likes += 1;
      else dislikes += 1;

      voted_users.push({ userId, vote: voteType });
    }
    await pool
      .request()
      .input("suggestionId", sql.Int, suggestionId)
      .input("likes", sql.Int, likes)
      .input("dislikes", sql.Int, dislikes)
      .input("votedUsers", sql.NVarChar(sql.MAX), JSON.stringify(voted_users))
      .query(
        "UPDATE PropertySuggestions SET likes = @likes, dislikes = @dislikes, voted_users = @votedUsers WHERE id = @suggestionId"
      );

    return { success: true, message: "Vote updated successfully." };
  } catch (error) {
    console.error("Error voting on suggestion:", error);
    return { success: false, message: "Database error" };
  }
};

const insertSuggestion = async (property_id, user_id, suggestion_text) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("property_id", sql.Int, property_id)
      .input("user_id", sql.Int, user_id)
      .input("suggestion_text", sql.NVarChar(sql.MAX), suggestion_text)
      .input("created_at", sql.DateTime, new Date())
      .query(`
        INSERT INTO PropertySuggestions (property_id, user_id, suggestion_text, created_at) 
        VALUES (@property_id, @user_id, @suggestion_text, @created_at)
      `);

    return { success: true, message: "Suggestion added successfully." };
  } catch (error) {
    console.error("Error inserting suggestion:", error);
    return { success: false, message: "Database error." };
  }
};

async function getUserDetails(userId) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT full_name, email, mobile_number FROM Users WHERE user_id = @userId"
      );

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("Database Error (getUserDetails):", error);
    return null;
  }
}

async function getAvailableProperties() {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.query(
      "SELECT property_id, project_name, apartment_type, carpet_area, development_stage, image_url FROM Properties"
    );

    return result.recordset;
  } catch (error) {
    console.error("Database Error (getAvailableProperties):", error);
    return [];
  }
}

async function getUserProperties(userId) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        `SELECT p.project_name, p.apartment_type, p.carpet_area 
         FROM Properties p
         INNER JOIN UserPropertyMapping upm ON p.property_id = upm.property_id
         WHERE upm.user_id = @userId`
      );

    return result.recordset;
  } catch (error) {
    console.error("Database Error (getUserProperties):", error);
    return [];
  }
}

async function getPropertySuggestions(propertyId) {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool
      .request()
      .input("propertyId", sql.Int, propertyId)
      .query(
        `SELECT suggestion_text, status, likes, dislikes 
         FROM Suggestions WHERE property_id = @propertyId`
      );

    return result.recordset;
  } catch (error) {
    console.error("Database Error (getPropertySuggestions):", error);
    return [];
  }
}

module.exports = {
    getDevelopers, insertDeveloper, googleLogin, loginDeveloper, getProjects, getUsers, insertUser,
    googleLoginUser, loginUser, fetchProjects, getPdfById, getUserProperties, getPropertyFile,
    voteOnSuggestion, insertSuggestion, getBrochureById, getUserDetails, getAvailableProperties, 
    getUserProperties, getPropertySuggestions
};
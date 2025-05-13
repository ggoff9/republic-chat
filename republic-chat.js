const { Client } = require('pg');

exports.dialogflowWebhook = async (req, res) => {
    // 1. Extract the product name from the Dialogflow request
    const productName = req.body.queryResult.parameters.PartNbr;

    // 2. Supabase connection details (replace with your actual credentials)
    const supabaseUrl = process.env.SUPABASE_URL; // Use environment variables
    const supabaseKey = process.env.SUPABASE_KEY; //  for security
    const connectionString = `${supabaseUrl}/postgres/public`;

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // For some cloud environments, you might need this
        }
    });

    try {
        await client.connect();

        // 3. Query the Supabase database
        const query = 'SELECT price FROM product_price WHERE part_nbr = $1';
        const values = [productName];
        const result = await client.query(query, values);

        // 4. Format the response
        let responseText = `I couldn't find the price for ${productName}.`;
        if (result.rows.length > 0) {
            const price = result.rows[0].price;
            responseText = `The price of ${productName} is $${price}.`;
        }

        // 5. Send the response back to Dialogflow
        res.send({
            fulfillmentText: responseText
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({
            fulfillmentText: 'An error occurred while fetching the price.'
        });
    } finally {
        await client.end();
    }
};


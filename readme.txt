# L.T.M Auri Discord Bot

## Overview
L.T.M Auri is a private Discord bot project, inspired by the worlds of Dungeons & Dragons, Lobotomy Corporation, Limbus Company, and Library of Ruina. It is designed to manage user data, inventories, and interactions with abnormalities in a text-based game format. This bot is open-source but not intended for use without proper authorization.

## Features
- **User Management**: Add or update user data in the database.
- **Inventory Management**: View, equip, and unequip items from your inventory.
- **Abnormality Work**: Perform work on abnormalities and gain rewards or take damage based on the results.
- **Shop**: Buy items from the shop using PE boxes.
- **Admin Commands**: Special commands for admins to manage user data and work success rates.

## Commands
- `/help`: Provides information about available commands.
- `/inventory`: Manage your inventory.
    - `view`: View your inventory.
    - `equip`: Equip an item from your inventory.
    - `unequip`: Unequip the currently equipped item.
- `/checkdata`: Check your own data.
- `/setuser`: Set a user field in the database.
- `/adduser`: Add or update a user in the database.
- `/work`: Perform work on an abnormality.
- `/usercheckdata`: Check anyone's data (Admin only).
- `/shop`: Buy items from the shop.
- `/lollang`: Replies with "Lollang!".

## Setup
1. Clone the repository.
2. Install the dependencies using `npm install`.
3. Create a `config.json` file with your Discord bot token, client ID, and guild ID.
4. Deploy the commands using `node deploycommands.js`.
5. Start the bot using `npm start`.

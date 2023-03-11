# Dr Wong

Dr Wong is a mix of Dr Mario and Tetris, featuring classic Dr Mario gameplay with added modern Tetris mechanics.

The game is built with SvelteKit and Bootstrap.

## Features

- Hard drop
- Longer queue
- Hold
- More time on the ground before being locked in
- More rotations and kicks

## Development

To run the game locally, you need to have Node.js and npm installed on your machine. Follow these steps:

1. Clone this repository: `git clone https://github.com/OkThomas1/Dr-Wong.git`
2. Change into the project directory: `cd Dr-Wong`
3. Install the dependencies: `npm install`
4. Start the development server: `npm run dev`

The game should now be available at `http://localhost:3000`.

## Deployment

To deploy the game, you can use a hosting service that supports Node.js applications. Here's how you can deploy the game to Vercel:

1. Sign up for a Vercel account at https://vercel.com/signup
2. Install the Vercel CLI: `npm i -g vercel`
3. Log in to your Vercel account: `vercel login`
4. Change into the project directory: `cd Dr-Wong`
5. Deploy the app: `vercel`

The deployment process will ask you a few questions, such as the name of your app and which branch to deploy from. Once the deployment is complete, your game should be available at the URL provided by Vercel.

## Todo

- Add settings for custom controls
- Add settings for in-game options such as speed and level
- Implement multiplayer

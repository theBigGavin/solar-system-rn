// This map explicitly requires all possible textures so Metro can bundle them.
export const textureMap: { [key: string]: any } = {
  // Planets & Moons
  'sun.jpg': require('../../assets/textures/sun.jpg'),
  'mercury.jpg': require('../../assets/textures/mercury.jpg'),
  'mercury-bump.jpg': require('../../assets/textures/mercury-bump.jpg'),
  'venus.jpg': require('../../assets/textures/venus.jpg'),
  'venus-bump.jpg': require('../../assets/textures/venus-bump.jpg'),
  'earth.jpg': require('../../assets/textures/earth.jpg'),
  'earth-bump.jpg': require('../../assets/textures/earth-bump.jpg'),
  'earth-specular.jpg': require('../../assets/textures/earth-specular.jpg'),
  'earth-clouds.jpg': require('../../assets/textures/earth-clouds.jpg'),
  'earth-clouds-alpha.jpg': require('../../assets/textures/earth-clouds-alpha.jpg'),
  'moon.jpg': require('../../assets/textures/moon.jpg'),
  'moon-bump.jpg': require('../../assets/textures/moon-bump.jpg'),
  'mars.jpg': require('../../assets/textures/mars.jpg'),
  'mars-bump.jpg': require('../../assets/textures/mars-bump.jpg'),
  'jupiter.jpg': require('../../assets/textures/jupiter.jpg'),
  'saturn.jpg': require('../../assets/textures/saturn.jpg'),
  'uranus.jpg': require('../../assets/textures/uranus.jpg'),
  'neptune.jpg': require('../../assets/textures/neptune.jpg'),
  'ganymede.jpg': require('../../assets/textures/ganymede.jpg'),
  'titan.webp': require('../../assets/textures/titan.webp'),
  'callisto.jpg': require('../../assets/textures/callisto.jpg'),
  'io.jpg': require('../../assets/textures/io.jpg'),
  'europa.jpg': require('../../assets/textures/europa.jpg'),
  'triton.jpg': require('../../assets/textures/triton.jpg'),

  // Rings
  'saturn-ring.png': require('../../assets/textures/saturn-ring.png'),

  // Environment (though likely loaded differently later)
  'environment/px.png': require('../../assets/textures/environment/px.png'),
  'environment/nx.png': require('../../assets/textures/environment/nx.png'),
  'environment/py.png': require('../../assets/textures/environment/py.png'),
  'environment/ny.png': require('../../assets/textures/environment/ny.png'),
  'environment/pz.png': require('../../assets/textures/environment/pz.png'),
  'environment/nz.png': require('../../assets/textures/environment/nz.png'),
};
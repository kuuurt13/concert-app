import express from 'express';
import skConfig from '../../../configs/songkick';

const router = express.Router();

const { artistImgSrc, imageSizes } = skConfig;

router.get('/artists/:id/image', redirectToArtistImage);

/* Routes */
async function redirectToArtistImage(req, res) {
  const { id } = req.params;
  let { size } = req.query;

  size = imageSizes[size] || imageSizes.md;

  res.redirect(`${artistImgSrc}${id}/${size}`);
}

export default router;

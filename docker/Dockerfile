# Rebuilds the OrangeHRM 5.9 Vue frontend with data-testid attributes added, so the
# CI-run app under test exposes stable selectors even though upstream ships none.
#
# - Stage `oh-base`  : the stock image, used only as a source to copy the Vue client
#                       source (src/client) and the app itself out of.
# - Stage `build`     : a Node image that patches the client source (docker/patches),
#                       yarn installs + builds it, then patches @ohrm/oxd's compiled
#                       bundle (docker/patch-oxd-testids.js) for the elements it
#                       renders internally (menu items, table rows, pagination) that
#                       app-level source can't reach, and rebuilds again with the
#                       patched dependency.
# - Final stage       : the stock image again, with web/dist replaced by our rebuilt,
#                       testid-patched bundle, and Conf.php baked in (see docker/Conf.php)
#                       so the image boots without a persistent /var/www/html volume -
#                       required for this to be reproducible in CI, where each run starts
#                       from a clean container with no prior state.
#
# NOTE ON LICENSING: OrangeHRM Community Edition is GPLv3 (see the base image's
# /var/www/html/LICENSE). The patches in docker/patches/ are distributed alongside
# this Dockerfile as plain diffs against the unmodified upstream source, satisfying
# GPLv3's source-availability requirement for anyone building this image.

FROM orangehrm/orangehrm:5.9 AS oh-base

FROM node:20-bookworm AS build
WORKDIR /build

# Mirrors the original src/client nesting depth so the package.json "build" script's
# relative --dest ../../web/dist resolves to /build/web/dist, not /web/dist.
COPY --from=oh-base /var/www/html/src/client ./src/client
COPY docker/patches/client-testid.patch ./client-testid.patch
RUN cd src/client && patch -p2 < ../../client-testid.patch

COPY docker/patch-oxd-testids.js ./patch-oxd-testids.js

WORKDIR /build/src/client
RUN yarn install --frozen-lockfile
RUN node /build/patch-oxd-testids.js
RUN yarn build

FROM orangehrm/orangehrm:5.9
COPY --from=build /build/web/dist /var/www/html/web/dist
COPY docker/Conf.php /var/www/html/lib/confs/Conf.php
RUN chown www-data:www-data /var/www/html/lib/confs/Conf.php

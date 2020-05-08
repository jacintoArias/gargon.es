FROM node:14.2.0-stretch

RUN apt-get update; \
  apt-get install -y \
  openssl

RUN curl -L https://get.rvm.io | bash 

RUN /bin/bash -l -c "rvm requirements"; \
  /bin/bash -l -c "rvm install 2.6.2"

RUN /bin/bash -l -c "gem install jekyll bundler";

# RUN useradd -ms /bin/bash jekyll

# USER jekyll

ENV APP_FOLDER=/opt/app/

WORKDIR $APP_FOLDER

COPY Gemfile $APP_FOLDER

RUN /bin/bash -l -c "bundle install --no-cache --path vendor"

COPY package.json yarn.lock $APP_FOLDER/

RUN yarn install

EXPOSE 4000

CMD ["yarn", "run", "gulp"]

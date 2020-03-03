dt=$(date '+%d/%m/%Y %H:%M:%S');
(echo ""; echo "<!-- $dt -->") >> ./widgets/vistabbar.html  && git pull origin master && iobroker upload vistabbar
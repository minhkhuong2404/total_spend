# How much have you spent on E-commerce websites?

## This tool is used to calculate the total spend of most popular E-commerce sites like Tiki, Shopee, Lazada.

To use it, open `Chrome DevTools` in your browser, and click on the `Console` tab.

Copy the following code in `totalSpend.js` and paste it into the console.

To calculate the total spend, you need to login first to the site that you want to calculate the total spend of. For Lazada site, you need to visit 'My order' in order to calculate this.

Then, call the following function to calculate the total spend.
  - `shopee()` to calculate the total spend in Shopee site.
  - `tiki()` to calculate the total spend in Tiki site.
  - `lazada()` to calculate the total spend in Lazada site.

##### Last but not least, there is a function to calculate the total spend for ShopeeFood site. However, it is not work the same as the other. You need to get your access token first.

	First you need to visit the login page first, then login. If you are login, you need to logout.

Open `Chrome DevTools` in your browser, and click on the `Network` tab. Take notice of a name called `social_login`. 

Click on that and go to the `Preview` tab on the right. You can see a field called `access_token`.

Copy that value into the `access_token` variable in line 11.

Then you can call the following function `shopeeFood()` to calculate the total spend.

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL,
    "wallet_balance" DECIMAL NOT NULL DEFAULT 0,
    "referral_code" TEXT NOT NULL,
    "referred_by_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "User_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "business_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "fssai_number" TEXT NOT NULL,
    "fssai_doc_url" TEXT NOT NULL,
    "govt_id_url" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cuisine_tags" TEXT NOT NULL,
    "food_type" TEXT NOT NULL,
    "lunch_window_start" TEXT,
    "lunch_window_end" TEXT,
    "dinner_window_start" TEXT,
    "dinner_window_end" TEXT,
    "delivery_pincodes" TEXT NOT NULL,
    "cover_photo_url" TEXT NOT NULL,
    "photo_urls" TEXT NOT NULL,
    "commission_rate" DECIMAL NOT NULL DEFAULT 0.12,
    "daily_capacity" INTEGER NOT NULL DEFAULT 999,
    "active_subscriber_count" INTEGER NOT NULL DEFAULT 0,
    "bank_account_name" TEXT NOT NULL,
    "bank_account_number" TEXT NOT NULL,
    "bank_ifsc" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "VendorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorOnboardingRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "years_of_operation" INTEGER NOT NULL,
    "daily_capacity" INTEGER NOT NULL,
    "fssai_doc_url" TEXT NOT NULL,
    "govt_id_url" TEXT NOT NULL,
    "hygiene_cert_url" TEXT,
    "sample_menu_text" TEXT NOT NULL,
    "rejection_reason" TEXT,
    "admin_notes" TEXT,
    "recaptcha_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "VendorOnboardingRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "meal_type" TEXT NOT NULL,
    "food_type" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "auto_renewal_default" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SubscriptionPlan_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "meal_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "food_type" TEXT NOT NULL,
    "photo_url" TEXT,
    "is_off_day" BOOLEAN NOT NULL DEFAULT false,
    "is_slot_disabled" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "food_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Addon_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItemAddon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menu_item_id" INTEGER NOT NULL,
    "addon_id" INTEGER NOT NULL,
    CONSTRAINT "MenuItemAddon_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuItemAddon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "Addon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "auto_renewal" BOOLEAN NOT NULL DEFAULT true,
    "delivery_notes" TEXT,
    "dietary_preference" TEXT,
    "meals_remaining" INTEGER NOT NULL,
    "resume_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscription_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "delivery_date" DATETIME NOT NULL,
    "meal_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "is_trial" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Order_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderAddon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "addon_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderAddon_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderAddon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "Addon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER,
    "subscription_id" INTEGER,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "amount" DECIMAL NOT NULL,
    "platform_fee" DECIMAL NOT NULL,
    "vendor_payout" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" TEXT NOT NULL,
    "vendor_response" TEXT,
    "admin_resolution" TEXT,
    "credit_issued" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Dispute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dispute_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dispute_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorPayout" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendor_id" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "processed_at" DATETIME,
    "utr_number" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendorPayout_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "photo_url" TEXT,
    "vendor_response" TEXT,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "VendorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "meta" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_user_id_key" ON "VendorProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_slug_key" ON "VendorProfile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_vendor_id_date_meal_type_key" ON "MenuItem"("vendor_id", "date", "meal_type");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemAddon_menu_item_id_addon_id_key" ON "MenuItemAddon"("menu_item_id", "addon_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpay_order_id_key" ON "Payment"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_vendor_id_key" ON "Review"("user_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

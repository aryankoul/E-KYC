pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

contract Kyc {

    address owner;

    constructor() public {
        owner = msg.sender;
    }

    struct User {
        bool present;
        string signature;
        string emailHash;
        address payable[] vers;
        string[] verAddress;
        uint256 totalCost;
        mapping(address => uint256) currentShare;
    }

    struct Verifier{
        bool present;
        bool verified;
        string bank;
        string publicKey;
        string[] customers;
        mapping(string => string) encryptedCid;
    }

    address[] unverified;
    address[] verified;

    //To store verifier data with key : publickey
    mapping(address => Verifier) Verifiers;

    //From User's unique ID -> Verifier public key
    mapping(string => string) linkedVerifiers;

    mapping(string => address) homeVerifier;


    mapping(string => User) Users;


    function concat(string memory _a, string memory _b) public view returns (string memory){
        bytes memory bytes_a = bytes(_a);
        bytes memory bytes_b = bytes(_b);
        string memory length_ab = new string(bytes_a.length + bytes_b.length);
        bytes memory bytes_c = bytes(length_ab);
        uint k = 0;
        for (uint i = 0; i < bytes_a.length; i++) bytes_c[k++] = bytes_a[i];
        for (uint j = 0; j < bytes_b.length; j++) bytes_c[k++] = bytes_b[j];
        return string(bytes_c);
    }

    function calculateShare(string memory userId) public view returns(uint256){
        uint256 totalCost = Users[userId].totalCost;
        uint count = Users[userId].vers.length;
        return totalCost/count;
    }

    function minm(uint256 a, uint256 b) public view returns(uint256){
        if(a<b)
            return a;
        else return b;
    }

    function costShare(string memory userId, string memory cid, string memory vAddress, uint mode) public payable {
        Verifiers[msg.sender].encryptedCid[userId] = cid;
        bool flag = false;
        for(uint i = 0;i<Verifiers[msg.sender].customers.length;i++){
            if(keccak256(bytes(Verifiers[msg.sender].customers[i])) == keccak256(bytes(userId))){
                flag = true;
            }
        }
        if(flag==false){//new verifier
            //push customer in verifier and vice versa
            Verifiers[msg.sender].customers.push(userId);
            Users[userId].vers.push(msg.sender);
            Users[userId].verAddress.push(vAddress);
        }
        if(mode==2){
            if(flag==true){
                msg.sender.transfer(msg.value);
            }
            else{
                address payable[] memory v = Users[userId].vers;
                uint256 count = v.length;
                uint256 etherSent = msg.value;
                uint256 share = calculateShare(userId);
                uint256 transferAmt = share/(count-1);
                uint256 spent = 0;
                for(uint i = 0; i<v.length; i++){
                    if(v[i] != msg.sender) {
                        v[i].transfer(transferAmt);
                        Users[userId].currentShare[v[i]] = Users[userId].currentShare[v[i]] - transferAmt;
                        etherSent = etherSent-transferAmt;
                        spent = spent+transferAmt;
                    }
                }
                Users[userId].currentShare[msg.sender] = spent;
                msg.sender.transfer(etherSent);
            }
        }
        else{
            address payable[] memory v = Users[userId].vers;
            uint256 count = v.length;
            uint256 etherSent = msg.value;
            uint256 share = calculateShare(userId);
            uint256 spent = 0;
            if(share>=Users[userId].currentShare[msg.sender]){
                uint256 divide = share - Users[userId].currentShare[msg.sender];
                for(uint i = 0;( i<count && divide>0);i++){
                    if(v[i]!=msg.sender){
                        if(Users[userId].currentShare[v[i]]>=share){
                            uint256 diff = Users[userId].currentShare[v[i]] - share;
                            uint256 minmm = minm(divide,diff);
                            v[i].transfer(minmm);
                            Users[userId].currentShare[v[i]] = Users[userId].currentShare[v[i]] - minmm;
                            spent = spent + minmm;
                        }
                    }
                }
                Users[userId].currentShare[msg.sender] = Users[userId].currentShare[msg.sender] + spent;
                msg.sender.transfer(etherSent-spent);
            }
        }
    }



    function updateCid(address newVerifierAddress, string memory userId, string  memory newEncryptedCid) public {
        address homeVerifierAddress = homeVerifier[userId];
        require(msg.sender == homeVerifierAddress,"Unauthorized update");
        Verifiers[newVerifierAddress].encryptedCid[userId] = newEncryptedCid;
        // for(uint i = 0;i<newVerifierAddress.length;i++){
        //     Verifiers[newVerifierAddress[i]].encryptedCid[userId] = newEncryptedCid[i];
        // }
    }

    function getCustomersList(address verifierAddress) public view returns(string memory){
        require(Verifiers[verifierAddress].verified == true, "Unauthorized verifier");
        string memory temp = "";
        for(uint i = 0;i<Verifiers[verifierAddress].customers.length;i++){
            if(i!=0){
             temp = concat(temp,"#");
             temp = concat(temp,Verifiers[verifierAddress].customers[i]);
            }
            else{
             temp = concat(temp,Verifiers[verifierAddress].customers[i]);
            }
        }
        return temp;
    }

    function getVerifiersList(string memory userId) public view returns(string memory){
        // require(homeVerifier[userId] == verifierAddress, "Unauthorized verifier");
        string memory temp = "";
        for(uint i = 0;i<Users[userId].verAddress.length;i++){
            if(i!=0){
             temp = concat(temp,"#");
             temp = concat(temp,Users[userId].verAddress[i]);
            }
            else{
             temp = concat(temp,Users[userId].verAddress[i]);
            }
        }
        return temp;
        // return Users[userId].verAddress;
    }

    function getCidForUser(string memory userId, address verifierAddress) public view returns(string memory){
        require(Users[userId].present==true,"User does not exists");
        return Verifiers[verifierAddress].encryptedCid[userId];
    }
    
    //For User Data

    function getUnverifiedVerifiers() public view returns (address[] memory) {
        require(msg.sender == owner, "Unauthorized");
        return unverified;
    }
    
    function pushVerifiers(address bankAddress, string memory bankName, string memory key) public returns (address[] memory){
        require(msg.sender == owner, "Unauthorized");
        string[] memory temp = new string[](0);
        Verifiers[bankAddress] = Verifier(true, true, bankName, key, temp);
        verified.push(bankAddress);
    }

    function getVerifiedVerifiers() public view returns (address[] memory){
        require(msg.sender == owner, "Unauthorized");
        return verified;
    }

     function getVerifier(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].bank;
    }

    function verifyVerifier(address verifierAddress) public returns(uint){
        require(msg.sender == owner, "Unauthorized");
        Verifiers[verifierAddress].verified = true;
        for(uint i = 0; i<unverified.length;i++){
            if(unverified[i] == verifierAddress) {

                verified.push(verifierAddress);
                
                unverified[i] = unverified[unverified.length - 1];
                delete unverified[unverified.length - 1];
                unverified.length--;
                return 1;
            }
        }
        return 0;
    }

    function getVerifierPublicKeyForUser(string memory _id) public view returns (string memory){
         require(Users[_id].present == true, "User does not exist");
        return (linkedVerifiers[_id]);
    }

    function addVerifier(string memory bankName, address verifierAddress, string memory publicKey) public {
        // require(msg.sender == owner,"Unauthorized");
        require(Verifiers[verifierAddress].present == false, "Verifier already exists");
        unverified.push(verifierAddress);
        string[] memory temp = new string[](0);
        Verifiers[verifierAddress] = Verifier(true, false, bankName, publicKey, temp);
    }

    function getPublicKey(address verifierAddress) public view returns(string memory){
        return Verifiers[verifierAddress].publicKey;
    }

    function addUser(string memory _id,
                    string memory _signature,
                    string memory _emailHash,
                    string memory encryptedCid,
                    address payable verifierAddress,
                    string memory vAddress,
                    uint mode,
                    uint256 costOccured) public {
        require(Verifiers[verifierAddress].present == true, "Unauthorized verifier");
        if(mode==1){
            require(
            Users[_id].present == false,
            "User already exist");
            address payable[] memory ver = new address payable[](1);
            string[] memory verAddress = new string[](1);
            ver[0] = verifierAddress;
            verAddress[0] = vAddress;
            Users[_id] = User(true, _signature, _emailHash, ver, verAddress, costOccured*(1 ether));
            Users[_id].currentShare[verifierAddress] = costOccured*(1 ether);
        }
        bool flag = false;
        for(uint i = 0;i<Verifiers[verifierAddress].customers.length;i++){
            if(keccak256(bytes(Verifiers[verifierAddress].customers[i])) == keccak256(bytes(_id)))
                flag = true;
        }
        if(flag==false){
            Verifiers[verifierAddress].customers.push(_id);
        }
        if(mode==3){
            Users[_id].signature = _signature;
            Users[_id].emailHash = _emailHash;
            Users[_id].totalCost = Users[_id].totalCost + costOccured*(1 ether);
            if(flag==false){
                Users[_id].vers.push(verifierAddress);
                Users[_id].verAddress.push(vAddress);
                Users[_id].currentShare[verifierAddress] = costOccured*(1 ether);
            }
            else{
                Users[_id].currentShare[verifierAddress] = Users[_id].currentShare[verifierAddress]+costOccured*(1 ether);
            }
        }
        linkedVerifiers[_id] = getPublicKey(verifierAddress);
        homeVerifier[_id] = verifierAddress;
        Verifiers[verifierAddress].encryptedCid[_id] = encryptedCid;
    }

    function getUserCid(string memory userId, address verifierAddress) public returns(string memory) {
        require(Verifiers[verifierAddress].verified==true,"Unauthorized");
        return Verifiers[verifierAddress].encryptedCid[userId];
    }

    function getUserSignature(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return(Users[_id].signature);
    }

    function getUserEmailHash(string memory _id) public view returns (string memory) {
        require(Users[_id].present == true, "User does not exist");

        return (Users[_id].emailHash);
    }

    function present(address[] memory unverifiedAddresses,address current) public view returns (bool){
        for(uint i = 0; i<unverifiedAddresses.length;i++){
            if(unverified[i] == current) {
                return true;
            }
        }
        return false;
    }

    function identifyAddress(address currentAddress) public view returns (uint) {
        if(currentAddress == owner)
        {
            return 1;
        }
        else if(present(unverified,currentAddress))
        {
            return 3;
        }
        else if(Verifiers[currentAddress].present == true)
        {
            return 2;
        }
        return 4;
    }

}